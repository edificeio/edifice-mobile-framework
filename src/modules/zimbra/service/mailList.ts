import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IMailList } from '~/modules/zimbra/state/mailList';

// Data type of what is given by the backend.
export type IMailListBackend = {
  id: string;
  date: string;
  subject: string;
  parent_id: string;
  thread_id: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  systemFolder: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  attachments: [];
  from: string;
}[];

const mailListAdapter: (data: IMailListBackend) => IMailList = data => {
  let result = [] as IMailList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    date: moment(item.date),
    subject: item.subject,
    parent_id: item.parent_id,
    thread_id: item.thread_id,
    state: item.state,
    unread: item.unread,
    response: item.response,
    hasAttachment: item.hasAttachment,
    systemFolder: item.systemFolder,
    to: item.to,
    cc: item.cc,
    bcc: item.bcc,
    displayNames: item.displayNames,
    attachments: item.attachments,
    from: item.from,
    isChecked: false,
  }));
  return result;
};

export const mailListService = {
  get: async (page: number, searchText: string, folder: string = 'inbox') => {
    const searchParam = searchText === '' ? '' : (('&search=' + searchText) as string);
    switch (folder) {
      case 'inbox':
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Inbox&page=${page}&unread=false${searchParam}`));
      case 'sendMessages':
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Sent&page=${page}&unread=false${searchParam}`));
      case 'drafts':
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Drafts&page=${page}&unread=false${searchParam}`));
      case 'trash':
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Trash&page=${page}&unread=false${searchParam}`));
      case 'spams':
        return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Junk&page=${page}&unread=false${searchParam}`));
      default:
        return [];
    }
  },
  getFromFolder: async (folderLocation: string, page: number = 1, searchText: string = '') => {
    const searchParam = searchText === '' ? '' : (('&search=' + searchText) as string);
    return mailListAdapter(await fetchJSONWithCache(`/zimbra/list?folder=/Inbox/${folderLocation}&page=${page}${searchParam}`));
  },
};
