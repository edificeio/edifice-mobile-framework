import RNFS from "react-native-fs";
import RNFB from "rn-fetch-blob";

import Conf from "../../../ode-framework-conf";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { getAuthHeader } from "../../infra/oauth";
import { dataActions } from "../../timeline/actions/commentList";

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

export type IAttachmentsBackend = {
  data: string;
  respInfo: {
    status: number;
  };
};

export type IAttachments = {
  contentType: string;
  filename: string;
  id: string;
  size: number;
}[];

const SearchUsersAdapter: (data: ISearchUsersGroups) => ISearchUsersGroups = data => {
  let result = {} as ISearchUsersGroups;
  if (!data) return result;
  result = {
    groups: data.groups,
    users: data.users,
  };
  return result;
};

const attachmentAdapter: (data: IAttachmentsBackend) => IAttachments = data => {
  try {
    return JSON.parse(data.data).attachments;
  } catch (e) {
    return [];
  }
};

export const newMailService = {
  getSearchUsers: async search => {
    const data = SearchUsersAdapter(await fetchJSONWithCache(`/zimbra/visible?search=${search}`));
    return data;
  },
  sendMail: async (mailDatas, draftId, inReplyTo) => {
    let urlParams = draftId !== "" || inReplyTo !== "" ? "?" : "";
    urlParams = draftId !== "" ? `${urlParams}id=${draftId}` : urlParams;
    urlParams = inReplyTo !== "" ? `${urlParams}In-Reply-To=${inReplyTo}` : urlParams;
    await fetchJSONWithCache(`/zimbra/send${urlParams}`, { method: "POST", body: JSON.stringify(mailDatas) });
  },
  makeDraftMail: async (mailDatas, inReplyTo, methodReply) => {
    let method = methodReply !== "" ? methodReply : "undefined";
    let urlParams = inReplyTo !== "" ? `?In-Reply-To=${inReplyTo}&reply=${method}` : "";
    const response = await fetchJSONWithCache(`/zimbra/draft${urlParams}`, { method: "POST", body: JSON.stringify(mailDatas) });
    return response.id;
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/zimbra/draft/${mailId}`, { method: "PUT", body: JSON.stringify(mailDatas) });
  },
  addAttachmentToDraft: async (draftId: string, files: any[]) => {
    const signedHeaders: { Authorization: string } = getAuthHeader();
    const url: string = `${Conf.currentPlatform.url}/zimbra/message/${draftId}/attachment`;
    const base64files: string[] = await Promise.all(files.map(file => RNFS.readFile(file.uri, "base64")));

    const results: any[] = [];

    for (let i = 0; i < files.length; i++) {
      await RNFB.fetch(
        "POST",
        url,
        {
          ...signedHeaders,
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename=${encodeURIComponent(files[i].name)}`,
        },
        base64files[i]
      ).then(response => {
        if (response && response.respInfo.status >= 200 && response.respInfo.status < 300) {
          Promise.resolve(attachmentAdapter(response));
          results.push(attachmentAdapter(response));
        } else {
          Promise.reject(response.data);
        }
      });
    }
    return results[files.length - 1];
  },
  deleteAttachment: async (draftId: string, attachmentId: string) => {
    return await fetchJSONWithCache(`/zimbra/message/${draftId}/attachment/${attachmentId}`, { method: "DELETE" });
  },
};
