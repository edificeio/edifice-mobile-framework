import { AccountType } from '~/framework/modules/auth/model';

export enum MailsDefaultFolders {
  DRAFTS = 'draft',
  INBOX = 'inbox',
  OUTBOX = 'outbox',
  TRASH = 'trash',
}

export enum MailsRecipientsType {
  TO = 'to',
  CC = 'cc',
  CCI = 'cci',
}

export interface MailsRecipientInfo {
  id: string;
  displayName: string;
  profile: AccountType;
}

export interface MailsRecipientGroupInfo {
  id: string;
  displayName: string;
  size: number;
  type: string; // ProfileGroup && ??
  subType: string; // ClassGroup && ??
}

export interface IMailsMailContent {
  attachments: {
    charset: string;
    contentTransferEncoding: string;
    contentType: string;
    fileName: string;
    id: string;
    name: string;
    size: number;
  }[];
  body: string;
  cc: MailsRecipientInfo[];
  cci: MailsRecipientInfo[];
  date: number;
  from: MailsRecipientInfo;
  id: string;
  language: string;
  parent_id: string;
  state: string;
  subject: string;
  text_searchable: string;
  thread_id: string;
  to: MailsRecipientInfo[];
}

export interface MailsFolderCount {
  count: number;
}

export enum MailsMailStatePreview {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
}

export interface IMailsMailPreview {
  cc: { users: MailsRecipientInfo[]; groups: MailsRecipientGroupInfo[] };
  cci: { users: MailsRecipientInfo[]; groups: MailsRecipientGroupInfo[] };
  count: number;
  date: number;
  from: MailsRecipientInfo;
  hasAttachment: boolean;
  id: string;
  state: MailsMailStatePreview;
  subject: string;
  to: { users: MailsRecipientInfo[]; groups: MailsRecipientGroupInfo[] };
  response: boolean;
  unread: boolean;
}

export interface IMailsFolder {
  depth: number;
  id: string;
  name: string;
  nbMessages: number;
  nbUnread: number;
  parent_id: string | null;
  subFolders?: IMailsFolder[];
}

export interface MailsFolderInfo {
  id: string;
  name: string;
}
