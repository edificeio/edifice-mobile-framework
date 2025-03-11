import { decode } from 'html-entities';
import moment from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IFolder, IMail, IQuota, IRecipient, ISignature } from '~/framework/modules/zimbra/model';
import { IDistantFileWithId, LocalFile } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

const BLANK_SUBJECT = '(Aucun objet)';

type IBackendAttachment = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
};

type IBackendFolder = {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: IBackendFolder[];
};

type IBackendMail = {
  id: string;
  date: number;
  subject: string;
  parent_id: string;
  thread_id: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  systemFolder: string;
  to: string[];
  cc: string[];
  bcc: string[];
  displayNames: string[][];
  attachments: IBackendAttachment[];
  body: string;
  from: string;
};

type IBackendQuota = {
  storage: number;
  quota: string;
};

type IBackendRecipient = {
  id: string;
  displayName?: string;
  name?: string;
  groupDisplayName: string | null;
  profile: string | null;
  structureName: string | null;
};

type IBackendRecipientDirectory = {
  groups: IBackendRecipient[];
  users: IBackendRecipient[];
};

type IBackendSignature = {
  preference: string;
  zimbraENTSignatureExists: boolean;
  id: string;
};

type IBackendUser = {
  id: string;
  displayName: string;
  type: string[];
};

type IBackendFolderList = IBackendFolder[];
type IBackendMailList = Omit<IBackendMail, 'body'>[];
type IBackendUserList = IBackendUser[];

const attachmentAdapter = (data: IBackendAttachment, platformUrl: string, mailId: string): IDistantFileWithId => {
  return {
    filename: data.filename,
    filesize: data.size,
    filetype: data.contentType,
    id: data.id,
    url: `${platformUrl}/zimbra/message/${mailId}/attachment/${data.id}`,
  };
};

const folderAdapter = (data: IBackendFolder): IFolder => {
  return {
    count: data.count,
    folders: data.folders.map(folderAdapter),
    id: data.id,
    name: data.folderName,
    path: data.path,
    unread: data.unread,
  };
};

const mailAdapter = (data: IBackendMail, platformUrl: string): IMail => {
  return {
    attachments: data.attachments.map(attachment => attachmentAdapter(attachment, platformUrl, data.id)),
    bcc: data.bcc,
    body: data.body.replaceAll('&#61;', '='), // AMV2-657 prevent encoded href
    cc: data.cc,
    date: moment(data.date),
    displayNames: data.displayNames,
    from: data.from,
    hasAttachment: data.hasAttachment,
    id: data.id,
    key: data.id,
    parentId: data.parent_id,
    response: data.response,
    state: data.state,
    subject: data.subject,
    systemFolder: data.systemFolder,
    threadId: data.thread_id,
    to: data.to,
    unread: data.unread,
  };
};

const mailFromListAdapter = (data: Omit<IBackendMail, 'body'>, platformUrl: string): Omit<IMail, 'body'> => {
  return {
    attachments: data.attachments.map(attachment => attachmentAdapter(attachment, platformUrl, data.id)),
    bcc: data.bcc,
    cc: data.cc,
    date: moment(data.date),
    displayNames: data.displayNames,
    from: data.from,
    hasAttachment: data.hasAttachment,
    id: data.id,
    key: data.id,
    parentId: data.parent_id,
    response: data.response,
    state: data.state,
    subject: data.subject,
    systemFolder: data.systemFolder,
    threadId: data.thread_id,
    to: data.to,
    unread: data.unread,
  };
};

const quotaAdapter = (data: IBackendQuota): IQuota => {
  return {
    quota: Number(data.quota),
    storage: data.storage,
  };
};

const recipientAdapter = (data: IBackendRecipient): IRecipient => {
  return {
    displayName: data.displayName ?? data.name!,
    groupDisplayName: data.groupDisplayName ?? undefined,
    id: data.id,
    profile: data.profile ?? undefined,
    structureName: data.structureName ?? undefined,
  };
};

const recipientDirectoryAdapter = (data: IBackendRecipientDirectory, query: string): IRecipient[] => {
  const groups = data.groups.map(recipientAdapter).filter(group => group.displayName.toLowerCase().includes(query.toLowerCase()));
  const users = data.users.map(recipientAdapter);
  return groups.concat(users);
};

const signatureAdapter = (data: IBackendSignature): ISignature => {
  const preference = JSON.parse(data.preference);
  return {
    content: extractTextFromHtml(decode(preference.signature)) ?? '',
    useSignature: preference.useSignature,
  };
};

export const zimbraService = {
  draft: {
    addAttachment: async (session: AuthLoggedAccount, draftId: string, file: LocalFile) => {
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
    create: async (session: AuthLoggedAccount, mail: Partial<IMail>, inReplyTo?: string, isForward?: boolean) => {
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
    deleteAttachment: async (session: AuthLoggedAccount, draftId: string, attachmentId: string) => {
      const api = `/zimbra/message/${draftId}/attachment/${attachmentId}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
    forward: async (session: AuthLoggedAccount, draftId: string, forwardFrom: string) => {
      const api = `/zimbra/message/${draftId}/forward/${forwardFrom}`;
      await fetchJSONWithCache(api, {
        method: 'PUT',
      });
    },
    update: async (session: AuthLoggedAccount, draftId: string, mail: Partial<IMail>) => {
      const api = `/zimbra/draft/${draftId}`;
      const body = JSON.stringify(mail);
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  folder: {
    create: async (session: AuthLoggedAccount, name: string, parentId?: string) => {
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
    get: async (session: AuthLoggedAccount, id: string, toggleRead: boolean = true) => {
      const api = `/zimbra/message/${id}?read=${toggleRead}`;
      const mail = (await fetchJSONWithCache(api)) as IBackendMail;
      if (!('id' in mail)) throw new Error();
      return mailAdapter(mail, session.platform.url);
    },
    send: async (session: AuthLoggedAccount, mail: Partial<IMail>, draftId?: string, inReplyTo?: string) => {
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
    delete: async (session: AuthLoggedAccount, ids: string[]) => {
      const api = '/zimbra/delete';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'DELETE',
      });
    },
    listFromFolder: async (session: AuthLoggedAccount, folder: string, page: number, search?: string) => {
      let api = `/zimbra/list?folder=${folder}&page=${page}&unread=false`;
      if (search) api += `&search=${search}`;
      const mails = (await fetchJSONWithCache(api)) as IBackendMailList;
      return mails.map(mail => mailFromListAdapter(mail, session.platform.url));
    },
    moveToFolder: async (session: AuthLoggedAccount, ids: string[], folderId: string) => {
      const api = `/zimbra/move/userfolder/${folderId}`;
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    moveToInbox: async (session: AuthLoggedAccount, ids: string[]) => {
      const api = '/zimbra/move/root';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    restore: async (session: AuthLoggedAccount, ids: string[]) => {
      const api = '/zimbra/restore';
      const body = JSON.stringify({
        id: ids,
      });
      await fetchJSONWithCache(api, {
        body,
        method: 'PUT',
      });
    },
    toggleUnread: async (session: AuthLoggedAccount, ids: string[], unread: boolean) => {
      let api = '/zimbra/toggleUnread?';
      api += ids.reduce((s, id) => s + 'id=' + id + '&', '');
      api += `unread=${unread}`;
      await fetchJSONWithCache(api, {
        method: 'POST',
      });
    },
    trash: async (session: AuthLoggedAccount, ids: string[]) => {
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
    get: async (session: AuthLoggedAccount) => {
      const api = '/zimbra/quota';
      const quota = (await fetchJSONWithCache(api)) as IBackendQuota;
      return quotaAdapter(quota);
    },
  },
  recipients: {
    search: async (session: AuthLoggedAccount, query: string) => {
      const api = `/zimbra/visible?search=${query}`;
      const recipientDirectory = (await fetchJSONWithCache(api)) as IBackendRecipientDirectory;
      return recipientDirectoryAdapter(recipientDirectory, query);
    },
  },
  rootFolders: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/zimbra/root-folder';
      const folders = (await fetchJSONWithCache(api)) as IBackendFolderList;
      return folders.map(folderAdapter);
    },
  },
  signature: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/zimbra/signature';
      const signature = (await fetchJSONWithCache(api)) as IBackendSignature;
      return signatureAdapter(signature);
    },
    update: async (session: AuthLoggedAccount, signature: string, useSignature: boolean) => {
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
    get: async (session: AuthLoggedAccount, id: string) => {
      const api = `/userbook/api/person?id=${id}&type=undefined`;
      const data = (await fetchJSONWithCache(api)) as { result: IBackendUserList };
      return data.result[0];
    },
  },
};
