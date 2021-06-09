/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { IMail } from "../state/mailContent";

// Data type of what is given by the backend.
export type IMailContentBackend = {
  id: string;
  date: string;
  state: string;
  unread: boolean;
  from: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  hasAttachment: boolean;
  attachments: [];
  subject: string;
  body: string;
  response: boolean;
  systemFolder: string;
  parent_id: string;
  thread_id: string;
};

const mailContentAdapter: (data: IMailContentBackend) => IMail = data => {
  let result = {} as IMail;
  if (!data) return result;
  result = {
    id: data.id,
    date: moment(data.date),
    state: data.state,
    unread: data.unread,
    from: data.from,
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
    displayNames: data.displayNames,
    hasAttachment: data.hasAttachment,
    attachments: data.attachments,
    subject: data.subject,
    body: data.body,
    response: data.response,
    systemFolder: data.systemFolder,
    parent_id: data.parent_id,
    thread_id: data.thread_id,
  };
  return result;
};

export type IUserInfosBackend = {
  result: Array<{
    id: string;
    displayNames: string;
    type: string[];
  }>;
};

const userInfosAdapter: (data: IUserInfosBackend) => IUserInfosBackend = data => {
  let result = {} as IUserInfosBackend;
  if (!data) return result;
  result = {
    result: data.result,
  };
  return result;
};

export const mailContentService = {
  get: async mailId => {
    const data = mailContentAdapter(await fetchJSONWithCache(`/zimbra/message/${mailId}`));
    return data;
  },
  getUserInfos: async userId => {
    const data = userInfosAdapter(await fetchJSONWithCache(`/userbook/api/person?id=${userId}&type=undefined`));
    return data;
  },
};
