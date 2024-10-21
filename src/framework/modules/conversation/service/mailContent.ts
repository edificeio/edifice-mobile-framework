import moment from 'moment';

import { IMail } from '~/framework/modules/conversation/state/mailContent';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// Data type of what is given by the backend.
export type IMailContentBackend = {
  id: string;
  date: string;
  state: string;
  from: string;
  to: [];
  cc: [];
  cci: [];
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
  cciName: string;
};

const mailContentAdapter: (data: IMailContentBackend) => IMail = data => {
  let result = {} as IMail;
  if (!data) throw new Error('(mailContentAdapter) data is not populated.');
  result = {
    attachments: data.attachments,
    body: data.body,
    cc: data.cc,
    cci: data.cci,
    cciName: data.cciName,
    ccName: data.ccName,
    date: moment(data.date),

    displayNames: data.displayNames,

    from: data.from,

    // Extra data
    fromName: data.fromName,

    id: data.id,

    language: data.language,

    parent_id: data.parent_id,

    state: data.state,
    subject: data.subject,
    text_searchable: data.text_searchable,
    thread_id: data.thread_id,
    to: data.to,
    toName: data.toName,
  };
  return result;
};

export type IUserInfosBackend = {
  result: {
    id: string;
    displayNames: string;
    type: string[];
  }[];
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
