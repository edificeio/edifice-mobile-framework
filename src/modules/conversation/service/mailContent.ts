/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IMail } from "../state/mailContent";

// Data type of what is given by the backend.
export type IMailContentBackend = {
  id: string;
  date: string;
  state: string;
  from: string;
  to: [];
  cc: [];
  displayNames: [];
  attachments: [];
  subject: string;
  body: string;
  parent_id: string;
  thread_id: string;
  fromName: string;
  toName: string;
  ccName: string;
  language: string;
  text_searchable: string;
  cci: [];
  cciName: string;
};

const mailContentAdapter: (data: IMailContentBackend) => IMail = data => {
  let result = {} as IMail;
  if (!data) return result;
  result = {
    id: data.id,
    date: moment(data.date),
    state: data.state,
    unread: false,
    from: data.from,
    to: data.to,
    cc: data.cc,
    cci: data.cci,
    displayNames: data.displayNames,
    attachments: data.attachments,
    subject: data.subject,
    body: data.body,
    systemFolder: "",
    parent_id: data.parent_id,
    thread_id: data.thread_id,
    // Extra data
    fromName: data.fromName,
    toName: data.toName,
    ccName: data.ccName,
    language: data.language,
    text_searchable: data.text_searchable,
    cciName: data.cciName
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
    const data = mailContentAdapter(await fetchJSONWithCache(`/conversation/message/${mailId}`));
    return data;
  },
  getUserInfos: async userId => {
    const data = userInfosAdapter(await fetchJSONWithCache(`/userbook/api/person?id=${userId}&type=undefined`));
    return data;
  },
};
