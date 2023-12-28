import moment from 'moment';

import { IMailList } from '~/framework/modules/conversation/state/mailList';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// Data type of what is given by the backend.
export type IMailListBackend = {
  id: string;
  date: string;
  subject: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  to: [];
  cc: [];
  displayNames: [];
  from: string;
  fromName: null;
  toName: null;
  ccName: null;
  cci: [];
  cciName: [];
  count: number;
}[];

const mailListAdapter: (data: IMailListBackend) => IMailList = data => {
  let result = [] as IMailList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    date: moment(item.date),
    subject: item.subject,
    state: item.state,
    unread: item.unread,
    response: item.response,
    hasAttachment: item.hasAttachment,
    to: item.to,
    cc: item.cc,
    displayNames: item.displayNames,
    from: item.from,
    // Extra data
    fromName: item.fromName,
    toName: item.toName,
    ccName: item.ccName,
    cci: item.cci,
    cciName: item.cciName,
    count: item.count,
  }));
  return result;
};

export const mailListService = {
  get: async (page, folder = 'inbox') => {
    const realFolder = {
      drafts: 'draft',
      inbox: 'inbox',
      sendMessages: 'outbox',
      trash: 'trash',
    }[folder];
    return (
      (realFolder && mailListAdapter(await fetchJSONWithCache(`/conversation/list/${realFolder}?page=${page}&unread=false`))) || []
    );
  },
  getFromFolder: async (folderId: string, page: number = 1) => {
    return mailListAdapter(await fetchJSONWithCache(`/conversation/list/${folderId}?restrain=&page=${page}&unread=false`));
  },
};
