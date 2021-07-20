import { Platform } from "react-native";

import Conf from "../../../../ode-framework-conf";
import { fetchJSONWithCache, signedFetch } from "../../../infra/fetchWithCache";

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
    return await fetchJSONWithCache(`/conversation/visible?search=${search}`);
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

      await fetchJSONWithCache(`/conversation/send${paramsUrl?.length > 0 ? "?" + paramsUrl : ""}`, {
      method: "POST",
      body: JSON.stringify(mailDatas),
    });
  },
  forwardMail: async (draftId, forwardFrom) => {
    await fetchJSONWithCache(`/zimbra/message/${draftId}/forward/${forwardFrom}`, {
      method: "PUT",
    });
  },
  makeDraftMail: async (mailDatas, inReplyTo) => {
    const params = {
      "In-Reply-To": inReplyTo
    };

    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

      const response = await fetchJSONWithCache(`/conversation/draft${paramsUrl?.length > 0 ? "?" + paramsUrl : ""}`, {
      method: "POST",
      body: JSON.stringify(mailDatas),
    });
    return response.id;
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/conversation/draft/${mailId}`, { method: "PUT", body: JSON.stringify(mailDatas) });
  },
  addAttachment: async (draftId: string, file: any) => {
    const formData = new FormData();
    formData.append("file", {
      uri: ((Platform.OS === "android") ? "file://" : "") + file.uri,
      type: file.mime,
      name: file.name
    });

    const response = await signedFetch(
      `${(Conf.currentPlatform as any).url}/conversation/message/${draftId}/attachment`,
      {
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        },
        method: "POST"
      }
    );
    const parsedResponse = await response.json();
    const sentAttachmentId = parsedResponse.id;
    const sentAttachment = {
      id: sentAttachmentId,
      filename: file.name,
      contentType: file.mime,
    };

    if (response && response.status >= 200 && response.status < 300) {
      console.log("Attachment upload successful", sentAttachment);
      return Promise.resolve([sentAttachment]);
    } else {
      console.log("Attachment upload failed", response);
      return Promise.reject(response);
    }
  },
  deleteAttachment: async (draftId: string, attachmentId: string) => {
    return await fetchJSONWithCache(`/conversation/message/${draftId}/attachment/${attachmentId}`, { method: "DELETE" });
  },
};
