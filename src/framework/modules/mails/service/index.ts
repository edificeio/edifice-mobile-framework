import {
  mailContentAdapter,
  mailsAdapter,
  MailsMailContentBackend,
  MailsMailPreviewBackend,
  MailsVisibleBackend,
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
    add: async (params: { mailId: string }, file: LocalFile, session: AuthActiveAccount) => {
      const url = `/conversation/message/${params.mailId}/attachment`;
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
            url: `/conversation/message/${params.mailId}/attachment/${json.id}`,
          };
        },
        {},
        SyncedFileWithId,
      );
      return uploadedFile;
    },
    remove: async (params: { mailId: string; attachmentId: string }) => {
      const api = `/conversation/message/${params.mailId}/attachment/${params.attachmentId}`;
      await http.fetchJsonForSession('DELETE', api);
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
    removeFromFolder: async (params: { ids: string[] }) => {
      //const idsToString = params.ids.reduce((s, id) => s + 'id=' + id + '&', '');
      const api = `/conversation/move/root?id=${params.ids[0]}`;
      await http.fetchJsonForSession('PUT', api);
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

      const api = inReplyTo
        ? `/conversation/send?In-Reply-To=${params.inReplyTo}`
        : draftId
          ? `/conversation/send?id=${params.draftId}`
          : '/conversation/send';

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
    get: async (params: { folderId: string; pageNb: number; pageSize: number; unread: boolean }) => {
      const api = `/conversation/api/folders/${params.folderId}/messages?page=${params.pageNb}&page_size=${params.pageSize}&unread=${params.unread}`;
      const backendMails = (await http.fetchJsonForSession('GET', api)) as MailsMailPreviewBackend[];

      const mails = backendMails.map(mail => mailsAdapter(mail));
      return mails as IMailsMailPreview[];
    },
  },
  recall: {
    post: async (params: { id: string }) => {
      const api = `/conversation/messages/${params.id}/recall`;
      await http.fetchJsonForSession('POST', api);
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
    getBySearch: async (params: { query: string }) => {
      const api = `/communication/visible/search?query=${params.query}`;

      const backendVisibles = (await http.fetchJsonForSession('GET', api)) as MailsVisibleBackend[];

      const visibles = backendVisibles.map(visible => mailVisibleAdapter(visible));
      return visibles as MailsVisible[];
    },
  },
};
