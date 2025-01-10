import { IMailsFolder, IMailsMailContent, IMailsMailPreview, MailsFolderCount } from '~/framework/modules/mails/model';
import { fetchJSONWithCache, fetchWithCache } from '~/infra/fetchWithCache';
import { mailContentAdapter, mailsAdapter, MailsMailContentBackend, MailsMailPreviewBackend } from './adapters/mails';

export const mailsService = {
  attachments: {
    add: async () => {},
    remove: async () => {
      const api = '/conversation/message/mailId/attachment/attachmentID';
    },
  },
  folder: {
    count: async (params: { folderId: string; unread: boolean }) => {
      const api = `/conversation/count/${params.folderId}?unread=${params.unread}`;
      const count = await fetchJSONWithCache(api);

      return count as MailsFolderCount;
    },
    create: async (payload: { name: string; parentId?: string }) => {
      const api = '/conversation/folder';
      const body = JSON.stringify({ name: payload.name, ...(payload.parentId ? { parentId: payload.parentId } : {}) });

      const data = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as { id: string };

      return data.id;
    },
  },
  folders: {
    get: async (params: { depth: number }) => {
      const api = `/conversation/api/folders?depth=${params.depth}`;
      const backendFolders = await fetchJSONWithCache(api);
      const folders = [...backendFolders];

      return folders as IMailsFolder[];
    },
  },
  mail: {
    delete: async (payload: { ids: string[] }) => {
      const api = '/conversation/delete';
      const body = JSON.stringify({ id: payload.ids });
      await fetchWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    forward: async (params: { mailId: string; forwardFrom: string }) => {
      // revoir forwardfrom
      const api = `/conversation/message/${params.mailId}/forward/${params.forwardFrom}`;
    },
    get: async (params: { mailId: string }) => {
      const api = `/conversation/api/messages/${params.mailId}`;
      const backendMail = (await fetchJSONWithCache(api)) as MailsMailContentBackend;

      const mail = mailContentAdapter(backendMail);
      return mail as IMailsMailContent;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const api = '/conversation/toggleUnread';
      const body = JSON.stringify({ id: payload.ids, unread: payload.unread });
      await fetchWithCache(api, {
        body,
        method: 'POST',
      });
    },
    moveToFolder: async (params: { folderId: string }, payload: { id: string[] }) => {
      const api = `/conversation/move/userfolder/${params.folderId}`;
    },
    moveToTrash: async (payload: { ids: string[] }) => {
      const api = '/conversation/trash';
      const body = JSON.stringify({ id: payload.ids });
      await fetchWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    removeFromFolder: async (params: { mailIds: string[] }) => {
      const idsToString = params.mailIds.reduce((s, id) => s + 'id=' + id + '&', '');
      const api = `/conversation/move/root?${idsToString}`;
    },
    restore: async (payload: { id: string[] }) => {
      const api = '/conversation/restore';
    },
    send: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/send?id=${params.draftId}`;
    },
    sendToDraft: async (payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string }) => {
      const api = '/conversation/draft';
    },
    updateDraft: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/draft/${params.draftId}`;
    },
  },
  mails: {
    get: async (params: { folderId: string; pageNb: number; pageSize: number; unread: boolean }) => {
      const api = `/conversation/api/folders/${params.folderId}/messages?page=${params.pageNb}&page_size=${params.pageSize}&unread=${params.unread}`;
      const backendMails = (await fetchJSONWithCache(api)) as MailsMailPreviewBackend[];

      const mails = backendMails.map(mail => mailsAdapter(mail));
      return mails as IMailsMailPreview[];
    },
  },
  signature: {},
  visibles: {
    getAll: async () => {
      const api = '/conversation/visible';
    },
    search: async (params: { search: string }) => {
      const api = `/conversation/visible?search=${params.search}`;
    },
  },
};
