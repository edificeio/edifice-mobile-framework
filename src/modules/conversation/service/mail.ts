import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

export const mailService = {
  toggleRead: async (mailIds: string[], read: boolean) => {
    const mailIdsData = {id: mailIds, unread: !read};
    await fetchJSONWithCache(`/conversation/toggleUnread`, {
      method: "post",
      body: JSON.stringify(mailIdsData)
    });
  },
  trashMails: async (mailIds: string[]) => {
    const mailIdsData = {id: mailIds};
    await fetchJSONWithCache(`/conversation/trash`, {
      method: "put",
      body: JSON.stringify(mailIdsData)
    });
  },
  restoreMails: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/restore?${idsString}`, {
      method: "put",
    });
  },
  deleteMails: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/delete?${idsString}`, {
      method: "delete",
    });
  },
  moveMailsToFolder: async (mailIds: string[], folderId: string) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/move/userfolder/${folderId}?${idsString}`, {
      method: "put",
    });
  },
  moveMailsToInbox: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/move/root?${idsString}`, {
      method: "put",
    });
  },
};
