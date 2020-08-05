import { fetchJSONWithCache } from "../../infra/fetchWithCache";

export const mailService = {
  toggleRead: async (mailIds: string[], read: boolean) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/toggleUnread?${idsString}unread=${(!read).toString()}`, {
      method: "post",
    });
  },
  trashMails: async (mailIds: string[]) => {
    const idsString = mailIds.reduce((s, id) => s + "id=" + id + "&", "");
    await fetchJSONWithCache(`/zimbra/trash?${idsString}`, {
      method: "put",
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
