import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IMail } from '~/framework/modules/zimbra/model';
import {
  attachmentAdapter,
  folderAdapter,
  mailAdapter,
  mailFromListAdapter,
  quotaAdapter,
  recipientDirectoryAdapter,
  signatureAdapter,
} from '~/framework/modules/zimbra/service/adapters';
import {
  IBackendAttachment,
  IBackendFolderList,
  IBackendMail,
  IBackendMailList,
  IBackendQuota,
  IBackendRecipientDirectory,
  IBackendSignature,
  IBackendUserList,
} from '~/framework/modules/zimbra/service/types';
import { LocalFile } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

const BLANK_SUBJECT = '(Aucun objet)';

export const zimbraService = {
  draft: {
    addAttachment: async (session: AuthActiveAccount, draftId: string, file: LocalFile) => {
      const api = `/zimbra/message/${draftId}/attachment`;
      let attachments: IBackendAttachment[] = [];
      await fileHandlerService.uploadFile(
        session,
        file,
        {
          binaryStreamOnly: true,
          headers: {
            'Content-Disposition': `attachment; filename="${file.filename}"`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          url: api,
        },
        data => {
          attachments = JSON.parse(data).attachments as IBackendAttachment[];
          return attachments as any;
        },
      );
      return attachments.map(attachment => attachmentAdapter(attachment, session.platform.url, draftId));
    },
    create: async (session: AuthActiveAccount, mail: Partial<IMail>, inReplyTo?: string, isForward?: boolean) => {
      let api = '/zimbra/draft';
      if (inReplyTo) api += `?In-Reply-To=${inReplyTo}`;
      if (isForward) api += '&reply=F';
      const body = JSON.stringify(mail);
      const response = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as { id: string };
      return response.id;
    },
    deleteAttachment: async (session: AuthActiveAccount, draftId: string, attachmentId: string) => {
      const api = `/zimbra/message/${draftId}/attachment/${attachmentId}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
    forward: async (session: AuthActiveAccount, draftId: string, forwardFrom: string) => {
      const api = `/zimbra/message/${draftId}/forward/${forwardFrom}`;
      await fetchJSONWithCache(api, {
        method: 'PUT',
      });
    },
    update: async (session: AuthActiveAccount, draftId: string, mail: Partial<IMail>) => {
      const api = `/zimbra/draft/${draftId}`;
      const body = JSON.stringify(mail);
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  folder: {
    create: async (session: AuthActiveAccount, name: string, parentId?: string) => {
      const api = '/zimbra/folder';
      const body = JSON.stringify({
        name,
        parentId,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      });
    },
  },
  mail: {
    get: async (session: AuthActiveAccount, id: string, toggleRead: boolean = true) => {
      const api = `/zimbra/message/${id}?read=${toggleRead}`;
      const mail = (await fetchJSONWithCache(api)) as IBackendMail;
      if (!('id' in mail)) throw new Error();
      return mailAdapter(mail, session.platform.url);
    },
    send: async (session: AuthActiveAccount, mail: Partial<IMail>, draftId?: string, inReplyTo?: string) => {
      let api = '/zimbra/send';
      if (draftId) api += `?id=${draftId}`;
      if (inReplyTo) api += `&In-Reply-To=${inReplyTo}`;
      if (!mail.subject) mail.subject = BLANK_SUBJECT;
      const body = JSON.stringify(mail);
      await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      });
    },
  },
  mails: {
    delete: async (session: AuthActiveAccount, ids: string[]) => {
      const api = '/zimbra/delete';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'DELETE',
      });
    },
    listFromFolder: async (session: AuthActiveAccount, folder: string, page: number, search?: string) => {
      let api = `/zimbra/list?folder=${folder}&page=${page}&unread=false`;
      if (search) api += `&search=${search}`;
      const mails = (await fetchJSONWithCache(api)) as IBackendMailList;
      return mails.map(mail => mailFromListAdapter(mail, session.platform.url));
    },
    moveToFolder: async (session: AuthActiveAccount, ids: string[], folderId: string) => {
      const api = `/zimbra/move/userfolder/${folderId}`;
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    moveToInbox: async (session: AuthActiveAccount, ids: string[]) => {
      const api = '/zimbra/move/root';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    restore: async (session: AuthActiveAccount, ids: string[]) => {
      const api = '/zimbra/restore';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    toggleUnread: async (session: AuthActiveAccount, ids: string[], unread: boolean) => {
      let api = '/zimbra/toggleUnread?';
      api += ids.reduce((s, id) => s + 'id=' + id + '&', '');
      api += `unread=${unread}`;
      await fetchJSONWithCache(api, {
        method: 'POST',
      });
    },
    trash: async (session: AuthActiveAccount, ids: string[]) => {
      const api = '/zimbra/trash';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  quota: {
    get: async (session: AuthActiveAccount) => {
      const api = '/zimbra/quota';
      const quota = (await fetchJSONWithCache(api)) as IBackendQuota;
      return quotaAdapter(quota);
    },
  },
  recipients: {
    search: async (session: AuthActiveAccount, query: string) => {
      const api = `/zimbra/visible?search=${query}`;
      const recipientDirectory = (await fetchJSONWithCache(api)) as IBackendRecipientDirectory;
      return recipientDirectoryAdapter(recipientDirectory, query);
    },
  },
  rootFolders: {
    get: async (session: AuthActiveAccount) => {
      const api = '/zimbra/root-folder';
      const folders = (await fetchJSONWithCache(api)) as IBackendFolderList;
      return folders.map(folderAdapter);
    },
  },
  signature: {
    get: async (session: AuthActiveAccount) => {
      const api = '/zimbra/signature';
      const signature = (await fetchJSONWithCache(api)) as IBackendSignature;
      return signatureAdapter(signature);
    },
    update: async (session: AuthActiveAccount, signature: string, useSignature: boolean) => {
      const api = '/zimbra/signature';
      const body = JSON.stringify({
        signature,
        useSignature,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  user: {
    get: async (session: AuthActiveAccount, id: string) => {
      const api = `/userbook/api/person?id=${id}&type=undefined`;
      const data = (await fetchJSONWithCache(api)) as { result: IBackendUserList };
      return data.result[0];
    },
  },
};
