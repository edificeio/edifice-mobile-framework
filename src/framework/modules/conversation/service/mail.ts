import { fetchJSONWithCache, fetchWithCache } from '~/infra/fetchWithCache';

export const mailService = {
  deleteMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchWithCache(`/conversation/delete`, {
      body: JSON.stringify(mailIdsData),
      // Not JSON return in this case by the backend : the intended response is empty.
      method: 'put',
    });
  },
  moveMailsToFolder: async (mailIds: string[], folderId: string) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/move/userfolder/${folderId}`, {
      body: JSON.stringify(mailIdsData),
      method: 'put',
    });
  },
  moveMailsToInbox: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + 'id=' + id + '&', '');
    await fetchJSONWithCache(`/conversation/move/root?${idsString}`, {
      method: 'put',
    });
  },
  restoreMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/restore`, {
      body: JSON.stringify(mailIdsData),
      method: 'put',
    });
  },
  toggleRead: async (mailIds: string[], read: boolean) => {
    const mailIdsData = { id: mailIds, unread: !read };
    await fetchJSONWithCache(`/conversation/toggleUnread`, {
      body: JSON.stringify(mailIdsData),
      method: 'post',
    });
  },
  trashMails: async (mailIds: string[]) => {
    const mailIdsData = { id: mailIds };
    await fetchJSONWithCache(`/conversation/trash`, {
      body: JSON.stringify(mailIdsData),
      method: 'put',
    });
  },
};
