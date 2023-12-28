import { fetchJSONWithCache, fetchWithCache } from '~/infra/fetchWithCache';

export const mailService = {
  toggleRead: async (mailIds: string[], read: boolean) => {
    const mailIdsData = { id: mailIds, unread: !read };
    await fetchJSONWithCache(`/conversation/toggleUnread`, {
      method: 'post',
      body: JSON.stringify(mailIdsData),
    });
  },
  trashMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/trash`, {
      method: 'put',
      body: JSON.stringify(mailIdsData),
    });
  },
  restoreMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/restore`, {
      method: 'put',
      body: JSON.stringify(mailIdsData),
    });
  },
  deleteMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchWithCache(`/conversation/delete`, {
      // Not JSON return in this case by the backend : the intended response is empty.
      method: 'put',
      body: JSON.stringify(mailIdsData),
    });
  },
  moveMailsToFolder: async (mailIds: string[], folderId: string) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/move/userfolder/${folderId}`, {
      method: 'put',
      body: JSON.stringify(mailIdsData),
    });
  },
  moveMailsToInbox: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + 'id=' + id + '&', '');
    await fetchJSONWithCache(`/conversation/move/root?${idsString}`, {
      method: 'put',
    });
  },
};
