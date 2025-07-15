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
  IMailsMailContent,
  IMailsMailPreview,
  IMailsSignaturePreferences,
  MailsFolderCount,
  MailsVisible,
} from '~/framework/modules/mails/model';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import http from '~/framework/util/http';

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
      await http.fetchJsonForSession('DELETE', api);
    },
  },
  bookmark: {
    getById: async (params: { id: string }) => {
      const api = `/directory/sharebookmark/${params.id}`;
      const backendBookmark = (await http.fetchJsonForSession('GET', api)) as MailsBookmarkBackend;

      const groups = backendBookmark.groups.map(group => mailGroupBookmarkAdapter(group));
      const users = backendBookmark.users.map(user => mailUserBookmarkAdapter(user));

      const bookmark = [...groups, ...users];
      return bookmark as MailsVisible[];
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
    delete: async (params: { id: string }) => {
      const api = `/conversation/api/folders/${params.id}`;
      await http.fetchJsonForSession('DELETE', api);
    },
    // move: async (params: { id: string }, payload: { parentId: string }) => {
    //   const api = `/conversation/folder/${params.id}`;
    //   const body = JSON.stringify({ parentId: payload.parentId });
    //   await http.fetchJsonForSession('PUT', api, { body });
    // },
    rename: async (params: { id: string }, payload: { name: string }) => {
      const api = `/conversation/folder/${params.id}`;
      const body = JSON.stringify({ name: payload.name });
      await http.fetchJsonForSession('PUT', api, { body });
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
    forward: async (params: { id: string }) => {
      const api = `/conversation/draft?In-Reply-To=${params.id}`;
      const bodyJson = JSON.stringify({ body: '', cc: [], cci: [], subject: '', to: [] });
      const data = (await http.fetchJsonForSession('POST', api, { body: bodyJson })) as { id: string };
      const api2 = `/conversation/message/${data.id}/forward/${params.id}`;
      await http.fetchForSession('PUT', api2);
      return data.id;
    },
    get: async (params: { id: string; originalFormat?: boolean }) => {
      const api = `/conversation/api/messages/${params.id}${params.originalFormat ? '?originalFormat=true' : ''}`;
      const backendMail = (await http.fetchJsonForSession('GET', api)) as MailsMailContentBackend;

      const mail = mailContentAdapter(backendMail);
      return mail as IMailsMailContent;
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
    recall: async (params: { id: string }) => {
      const api = `/conversation/api/messages/${params.id}/recall`;
      await http.fetchForSession('POST', api);
    },
    removeFromFolder: async (params: { ids: string[] }) => {
      params.ids.forEach(async id => {
        const api = `/conversation/move/root?id=${id}`;
        await http.fetchJsonForSession('PUT', api);
      });
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
      const { body, cc, cci, subject, to } = payload;

      const baseUrl = '/conversation/send';
      const paramsUrl = new URLSearchParams();

      if (draftId) paramsUrl.set('id', draftId);
      if (inReplyTo) paramsUrl.set('In-Reply-To', inReplyTo);

      const queryString = paramsUrl.toString();
      const api = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });
      await http.fetchJsonForSession('POST', api, { body: bodyJson });
    },
    sendToDraft: async (payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string }) => {
      const api = '/conversation/draft';
      const { body, cc, cci, subject, to } = payload;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });

      const draft = (await http.fetchJsonForSession('POST', api, { body: bodyJson })) as { id: string };
      return draft.id;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const api = '/conversation/toggleUnread';
      const body = JSON.stringify({ id: payload.ids, unread: payload.unread });
      await http.fetchJsonForSession('POST', api, { body });
    },
    updateDraft: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/draft/${params.draftId}`;
      const { body, cc, cci, subject, to } = payload;

      const bodyJson = JSON.stringify({ body, cc, cci, subject, to });
      await http.fetchJsonForSession('PUT', api, { body: bodyJson });
    },
  },
  mails: {
    get: async (params: { folderId: string; pageNb: number; pageSize: number; search?: string }) => {
      const api = `/conversation/api/folders/${params.folderId}/messages?${params.search?.length ? `search="${params.search}&"` : ''}page=${params.pageNb}&page_size=${params.pageSize}`;
      const backendMails = (await http.fetchJsonForSession('GET', api)) as MailsMailPreviewBackend[];

      const mails = backendMails.map(mail => mailsAdapter(mail));
      return mails as IMailsMailPreview[];
    },
  },
  signature: {
    get: async () => {
      const api = '/userbook/preference/conversation';
      const preferences = (await http.fetchJsonForSession('GET', api)) as { preference: IMailsSignaturePreferences };

      return preferences.preference as IMailsSignaturePreferences;
    },
    update: async (payload: { signature: string; useSignature: boolean }) => {
      const api = '/userbook/preference/conversation';
      const body = JSON.stringify(payload);
      await http.fetchJsonForSession('PUT', api, { body });
    },
  },
  visibles: {
    get: async () => {
      const api = `/communication/visible/search`;

      const backendVisibles = (await http.fetchJsonForSession('GET', api)) as MailsVisibleBackend[];

      const visibles = backendVisibles.map(visible => mailVisibleAdapter(visible));
      return visibles as MailsVisible[];
    },
  },
};
