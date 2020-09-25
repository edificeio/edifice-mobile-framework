import RNFS from "react-native-fs";
import RNFB from "rn-fetch-blob";

import Conf from "../../../ode-framework-conf";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { getAuthHeader } from "../../infra/oauth";

export type IUser = {
  id: string;
  displayName: string;
  groupDisplayName: string;
  profile: string;
  structureName: string;
};

export type ISearchUsers = IUser[];

export type ISearchUsersGroups = {
  groups: {
    id: string;
    name: string;
    displayName: string;
    profile: string;
    structureName: string;
  }[];
  users: ISearchUsers;
};

export const newMailService = {
  searchUsers: async search => {
    return await fetchJSONWithCache(`/zimbra/visible?search=${search}`);
  },
  sendMail: async (mailDatas, draftId, inReplyTo) => {
    const params = {
      id: draftId,
      "In-Reply-To": inReplyTo,
    };

    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    await fetchJSONWithCache(`/zimbra/send${paramsUrl?.length > 0 ? "?" + paramsUrl : ""}`, {
      method: "POST",
      body: JSON.stringify(mailDatas),
    });
  },
  makeDraftMail: async (mailDatas, inReplyTo, isForward) => {
    const params = {
      "In-Reply-To": inReplyTo,
      reply: isForward ? "F" : null,
    };

    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const response = await fetchJSONWithCache(`/zimbra/draft${paramsUrl?.length > 0 ? "?" + paramsUrl : ""}`, {
      method: "POST",
      body: JSON.stringify(mailDatas),
    });
    return response.id;
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/zimbra/draft/${mailId}`, { method: "PUT", body: JSON.stringify(mailDatas) });
  },
  addAttachment: async (draftId: string, file: any, handleProgession) => {
    const url = `${Conf.currentPlatform.url}/zimbra/message/${draftId}/attachment`;
    const fileObject = await RNFS.readFile(file.uri, "base64");

    return RNFB.fetch(
      "POST",
      url,
      {
        ...getAuthHeader(),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
      fileObject
    )
      .uploadProgress({ interval: 100 }, (written, total) => handleProgession((written / total) * 100))
      .then(response => {
        if (response && response.respInfo.status >= 200 && response.respInfo.status < 300) {
          console.log("Attachment upload successful", response.data);
          return Promise.resolve(JSON.parse(response.data).attachments);
        } else {
          console.log("Attachment upload failed", response.data);
          return Promise.reject(response.data);
        }
      });
  },
  deleteAttachment: async (draftId: string, attachmentId: string) => {
    return await fetchJSONWithCache(`/zimbra/message/${draftId}/attachment/${attachmentId}`, { method: "DELETE" });
  },
};
