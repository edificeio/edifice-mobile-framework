import {
  IMailsFolder,
  IMailsMailContent,
  IMailsMailPreview,
  MailsFolderCount,
  MailsVisible,
} from '~/framework/modules/mails/model';
import http from '~/framework/util/http';
import {
  mailContentAdapter,
  mailsAdapter,
  MailsMailContentBackend,
  MailsMailPreviewBackend,
  MailsVisiblesBackend,
  mailVisiblesGroupAdapter,
  mailVisiblesUserAdapter,
} from './adapters/mails';

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
      const count = await http.fetchJsonForSession('GET', api);

      return count as MailsFolderCount;
    },
    create: async (payload: { name: string; parentId?: string }) => {
      const api = '/conversation/folder';
      const body = JSON.stringify({ name: payload.name, ...(payload.parentId ? { parentId: payload.parentId } : {}) });

      const data = (await http.fetchJsonForSession('POST', api, { body })) as { id: string };
      return data.id;
    },
  },
  folders: {
    get: async (params: { depth: number }) => {
      const api = `/conversation/api/folders?depth=${params.depth}`;
      const backendFolders = await http.fetchJsonForSession('GET', api);
      const folders = [...backendFolders];

      return folders as IMailsFolder[];
    },
  },
  mail: {
    delete: async (payload: { ids: string[] }) => {
      const api = '/conversation/delete';
      const body = JSON.stringify({ id: payload.ids });
      await http.fetchForSession('PUT', api, { body });
    },
    forward: async (params: { mailId: string; forwardFrom: string }) => {
      // revoir forwardfrom
      const api = `/conversation/message/${params.mailId}/forward/${params.forwardFrom}`;
    },
    get: async (params: { id: string }) => {
      const api = `/conversation/api/messages/${params.id}`;
      const backendMail = (await http.fetchJsonForSession('GET', api)) as MailsMailContentBackend;

      const mail = mailContentAdapter(backendMail);
      return mail as IMailsMailContent;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const api = '/conversation/toggleUnread';
      const body = JSON.stringify({ id: payload.ids, unread: payload.unread });
      await http.fetchJsonForSession('POST', api, { body });
    },
    moveToFolder: async (params: { folderId: string }, payload: { ids: string[] }) => {
      const api = `/conversation/move/userfolder/${params.folderId}`;
      const body = JSON.stringify({ id: payload.ids });
      await http.fetchJsonForSession('PUT', api, { body });
    },
    moveToTrash: async (payload: { ids: string[] }) => {
      const api = '/conversation/trash';
      const body = JSON.stringify({ id: payload.ids });
      await http.fetchJsonForSession('PUT', api, { body });
    },
    removeFromFolder: async (params: { mailIds: string[] }) => {
      const idsToString = params.mailIds.reduce((s, id) => s + 'id=' + id + '&', '');
      const api = `/conversation/move/root?${idsToString}`;
    },
    restore: async (payload: { ids: string[] }) => {
      const api = '/conversation/restore';
      const body = JSON.stringify({ id: payload.ids });
      await http.fetchJsonForSession('PUT', api, { body });
    },
    send: async (
      params: { draftId?: string; inReplyTo?: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const { draftId, inReplyTo } = params;
      const { body, to, cc, cci, subject } = payload;

      const api = inReplyTo
        ? `/conversation/send?In-Reply-To=${params.inReplyTo}`
        : draftId
          ? `/conversation/send?id=${params.draftId}`
          : '/conversation/send';

      const bodyJson = JSON.stringify({ body, to, cc, cci, subject });
      await http.fetchJsonForSession('POST', api, { body: bodyJson });
    },
    sendToDraft: async (payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string }) => {
      const api = '/conversation/draft';
      const { body, to, cc, cci, subject } = payload;

      const bodyJson = JSON.stringify({ body, to, cc, cci, subject });
      await http.fetchJsonForSession('POST', api, { body: bodyJson });
    },
    updateDraft: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/draft/${params.draftId}`;
      const { body, to, cc, cci, subject } = payload;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });
      await http.fetchJsonForSession('PUT', api, { body: bodyJson });
    },
  },
  mails: {
    get: async (params: { folderId: string; pageNb: number; pageSize: number; unread: boolean }) => {
      const api = `/conversation/api/folders/${params.folderId}/messages?page=${params.pageNb}&page_size=${params.pageSize}&unread=${params.unread}`;
      const backendMails = (await http.fetchJsonForSession('GET', api)) as MailsMailPreviewBackend[];

      const mails = backendMails.map(mail => mailsAdapter(mail));
      return mails as IMailsMailPreview[];
    },
  },
  signature: {},
  visibles: {
    getAll: async () => {
      const api = '/conversation/visible';
      const backendVisibles = (await http.fetchJsonForSession('GET', api)) as MailsVisiblesBackend;

      const groups = backendVisibles.groups.map(group => mailVisiblesGroupAdapter(group));
      const users = backendVisibles.users.map(user => mailVisiblesUserAdapter(user));
      const visibles = [...users, ...groups];

      return visibles as MailsVisible[];
    },
    search: async (params: { search: string }) => {
      const api = `/conversation/visible?search=${params.search}`;
    },
  },
};
