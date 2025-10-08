import {
  mailContentAdapter,
  mailGroupBookmarkAdapter,
  mailsAdapter,
  MailsBookmarkBackend,
  MailsMailContentBackend,
  MailsMailPreviewBackend,
  MailsVisibleBackend,
  mailUserBookmarkAdapter,
  mailVisibleAdapter,
} from './adapters/mails';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  IMailsFolder,
  IMailsSignaturePreferences,
  MailsConversationPayload,
  MailsFolderCount,
} from '~/framework/modules/mails/model';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { sessionFetch } from '~/framework/util/transport';

export const mailsService = {
  attachments: {
    add: async (params: { draftId: string }, file: LocalFile, session: AuthActiveAccount) => {
      const url = `/conversation/message/${params.draftId}/attachment`;
      const uploadedFile = await fileHandlerService.uploadFile<SyncedFileWithId>(
        session,
        file,
        {
          headers: {
            Accept: 'application/json',
          },
          url,
        },
        data => {
          const json = JSON.parse(data) as { id: string };
          return {
            id: json.id,
            url: `/conversation/message/${params.draftId}/attachment/${json.id}`,
          };
        },
        {},
        SyncedFileWithId,
      );
      return uploadedFile;
    },
    remove: async (params: { draftId: string; attachmentId: string }) => {
      const api = `/conversation/message/${params.draftId}/attachment/${params.attachmentId}`;
      await sessionFetch(api, { method: 'DELETE' });
    },
  },
  bookmark: {
    getById: async (params: { id: string }) => {
      const api = `/directory/sharebookmark/${params.id}`;
      const backendBookmark = await sessionFetch.json<MailsBookmarkBackend>(api, { method: 'GET' });

      const groups = backendBookmark.groups.map(group => mailGroupBookmarkAdapter(group));
      const users = backendBookmark.users.map(user => mailUserBookmarkAdapter(user));

      const bookmark = [...groups, ...users];
      return bookmark;
    },
  },
  folder: {
    count: async (params: { folderId: string; unread: boolean }) => {
      const api = `/conversation/count/${params.folderId}?unread=${params.unread}`;
      const count = await sessionFetch.json<MailsFolderCount>(api, { method: 'GET' });

      return count;
    },
    create: async (payload: { name: string; parentId?: string }) => {
      const api = '/conversation/folder';
      const body = JSON.stringify({ name: payload.name, ...(payload.parentId ? { parentId: payload.parentId } : {}) });

      const data = await sessionFetch.json<{ id: string }>(api, { body, method: 'POST' });
      return data.id;
    },
    delete: async (params: { id: string }) => {
      const api = `/conversation/api/folders/${params.id}`;
      await sessionFetch(api, { method: 'DELETE' });
    },
    // move: async (params: { id: string }, payload: { parentId: string }) => {
    //   const api = `/conversation/folder/${params.id}`;
    //   const body = JSON.stringify({ parentId: payload.parentId });
    //   await http.fetchJsonForSession('PUT', api, { body });
    // },
    rename: async (params: { id: string }, payload: { name: string }) => {
      const api = `/conversation/folder/${params.id}`;
      const body = JSON.stringify({ name: payload.name });
      await sessionFetch(api, { body, method: 'PUT' });
    },
  },
  folders: {
    get: async (params: { depth: number }) => {
      const api = `/conversation/api/folders?depth=${params.depth}`;
      const backendFolders = await sessionFetch.json<IMailsFolder[]>(api, { method: 'GET' });
      const folders = [...backendFolders];

      return folders;
    },
  },
  mail: {
    delete: async (payload: { ids: string[] }) => {
      const api = '/conversation/delete';
      const body = JSON.stringify({ id: payload.ids });
      await sessionFetch(api, { body, method: 'PUT' });
    },
    forward: async (params: { id: string }) => {
      const api = `/conversation/draft?In-Reply-To=${params.id}`;
      const bodyJson = JSON.stringify({ body: '', cc: [], cci: [], subject: '', to: [] });
      const data = await sessionFetch.json<{ id: string }>(api, { body: bodyJson, method: 'POST' });

      const api2 = `/conversation/message/${data.id}/forward/${params.id}`;
      await sessionFetch.json(api2, { method: 'PUT' });
      return data.id;
    },
    get: async (params: { id: string; originalFormat?: boolean }) => {
      const api = `/conversation/api/messages/${params.id}${params.originalFormat ? '?originalFormat=true' : ''}`;
      const backendMail = await sessionFetch.json<MailsMailContentBackend>(api, { method: 'GET' });

      const mail = mailContentAdapter(backendMail);
      return mail;
    },
    moveToFolder: async (params: { folderId: string }, payload: { ids: string[] }) => {
      const api = `/conversation/move/userfolder/${params.folderId}`;
      const body = JSON.stringify({ id: payload.ids });
      await sessionFetch(api, { body, method: 'PUT' });
    },
    moveToTrash: async (payload: { ids: string[] }) => {
      const api = '/conversation/trash';
      const body = JSON.stringify({ id: payload.ids });
      await sessionFetch(api, { body, method: 'PUT' });
    },
    recall: async (params: { id: string }) => {
      const api = `/conversation/api/messages/${params.id}/recall`;
      await sessionFetch(api, { method: 'POST' });
    },
    removeFromFolder: async (params: { ids: string[] }) => {
      params.ids.forEach(async id => {
        const api = `/conversation/move/root?id=${id}`;
        await sessionFetch(api, { method: 'PUT' });
      });
    },
    restore: async (payload: { ids: string[] }) => {
      const api = '/conversation/restore';
      const body = JSON.stringify({ id: payload.ids });
      await sessionFetch(api, { body, method: 'PUT' });
    },
    send: async (params: { draftId?: string; inReplyTo?: string }, payload: MailsConversationPayload) => {
      const { draftId, inReplyTo } = params;
      const { body, cc, cci, subject, to } = payload;

      const baseUrl = '/conversation/send';
      const paramsUrl = new URLSearchParams();

      if (draftId) paramsUrl.set('id', draftId);
      if (inReplyTo) paramsUrl.set('In-Reply-To', inReplyTo);

      const queryString = paramsUrl.toString();
      const api = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });
      const response = await sessionFetch(api, { body: bodyJson, method: 'POST' });
      const jsonRsponse = await response.json();

      return jsonRsponse;
    },
    sendToDraft: async (params: { inReplyTo?: string }, payload: MailsConversationPayload) => {
      const api = `/conversation/draft${params.inReplyTo ? `?In-Reply-To=${params.inReplyTo}` : ''}`;
      const { body, cc, cci, subject, to } = payload;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });

      const draft = await sessionFetch.json<{ id: string }>(api, { body: bodyJson, method: 'POST' });
      return draft.id;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const api = '/conversation/toggleUnread';
      const body = JSON.stringify({ id: payload.ids, unread: payload.unread });
      await sessionFetch(api, { body, method: 'POST' });
    },
    updateDraft: async (params: { draftId: string }, payload: MailsConversationPayload) => {
      const api = `/conversation/draft/${params.draftId}`;
      const { body, cc, cci, subject, to } = payload;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });
      await sessionFetch(api, { body: bodyJson, method: 'PUT' });
    },
  },
  mails: {
    get: async (params: { folderId: string; pageNb: number; pageSize: number; search?: string }) => {
      const api = `/conversation/api/folders/${params.folderId}/messages?${params.search?.length ? `search="${params.search}&"` : ''}page=${params.pageNb}&page_size=${params.pageSize}`;
      const backendMails = await sessionFetch.json<MailsMailPreviewBackend[]>(api, { method: 'GET' });

      const mails = backendMails.map(mail => mailsAdapter(mail));
      return mails;
    },
  },
  signature: {
    get: async () => {
      const api = '/userbook/preference/conversation';
      const preferences = await sessionFetch.json<{ preference: IMailsSignaturePreferences }>(api, { method: 'GET' });

      return preferences.preference;
    },
    update: async (payload: { signature: string; useSignature: boolean }) => {
      const api = '/userbook/preference/conversation';
      const body = JSON.stringify(payload);
      await sessionFetch(api, { body, method: 'PUT' });
    },
  },
  visibles: {
    get: async () => {
      const api = `/communication/visible/search`;

      const backendVisibles = await sessionFetch.json<MailsVisibleBackend[]>(api, { method: 'GET' });

      const visibles = backendVisibles.map(visible => mailVisibleAdapter(visible));
      return visibles;
    },
  },
};
