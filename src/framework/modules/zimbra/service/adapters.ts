import { decode } from 'html-entities';
import moment from 'moment';

import { IFolder, IMail, IQuota, IRecipient, ISignature } from '~/framework/modules/zimbra/model';
import {
  IBackendAttachment,
  IBackendFolder,
  IBackendMail,
  IBackendQuota,
  IBackendRecipient,
  IBackendRecipientDirectory,
  IBackendSignature,
} from '~/framework/modules/zimbra/service/types';
import { IDistantFileWithId } from '~/framework/util/fileHandler';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

export const attachmentAdapter = (data: IBackendAttachment, platformUrl: string, mailId: string): IDistantFileWithId => {
  return {
    filename: data.filename,
    filesize: data.size,
    filetype: data.contentType,
    id: data.id,
    url: `${platformUrl}/zimbra/message/${mailId}/attachment/${data.id}`,
  };
};

export const folderAdapter = (data: IBackendFolder): IFolder => {
  return {
    count: data.count,
    folders: data.folders.map(folderAdapter),
    id: data.id,
    name: data.folderName,
    path: data.path,
    unread: data.unread,
  };
};

export const mailAdapter = (data: IBackendMail, platformUrl: string): IMail => {
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

export const mailFromListAdapter = (data: Omit<IBackendMail, 'body'>, platformUrl: string): Omit<IMail, 'body'> => {
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

export const quotaAdapter = (data: IBackendQuota): IQuota => {
  return {
    quota: Number(data.quota),
    storage: data.storage,
  };
};

export const recipientAdapter = (data: IBackendRecipient): IRecipient => {
  return {
    displayName: data.displayName ?? data.name!,
    groupDisplayName: data.groupDisplayName ?? undefined,
    id: data.id,
    profile: data.profile ?? undefined,
    structureName: data.structureName ?? undefined,
  };
};

export const recipientDirectoryAdapter = (data: IBackendRecipientDirectory, query: string): IRecipient[] => {
  const groups = data.groups.map(recipientAdapter).filter(group => group.displayName.toLowerCase().includes(query.toLowerCase()));
  const users = data.users.map(recipientAdapter);
  return groups.concat(users);
};

export const signatureAdapter = (data: IBackendSignature): ISignature => {
  const preference = JSON.parse(data.preference);
  const content = decode(preference.signature);
  return {
    content: (content.includes('&lt;') ? extractTextFromHtml(content) : content) ?? '',
    useSignature: preference.useSignature,
  };
};
