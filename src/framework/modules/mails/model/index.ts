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

export enum MailsVisibleType {
  GROUP = 'Group',
  USER = 'User',
}

export interface MailsRecipients {
  users: MailsRecipientInfo[];
  groups: MailsRecipientGroupInfo[];
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

export interface IMailsMailAttachment {
  charset: string;
  contentTransferEncoding: string;
  contentType: string;
  filename: string;
  id: string;
  name: string;
  size: number;
}

export interface IMailsMailContent {
  attachments: IMailsMailAttachment[];
  body: string;
  cc: MailsRecipients;
  cci: MailsRecipients;
  date: number;
  from: MailsRecipientInfo;
  folder_id: string | null;
  id: string;
  language: string;
  parent_id: string;
  state: string;
  subject: string;
  thread_id: string;
  to: MailsRecipients;
  trashed: boolean;
  unread: boolean;
}

export interface MailsFolderCount {
  count: number;
}

export enum MailsMailStatePreview {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
}

export interface IMailsMailPreview {
  cc: MailsRecipients;
  cci: MailsRecipients;
  count: number;
  date: number;
  from: MailsRecipientInfo;
  hasAttachment: boolean;
  id: string;
  state: MailsMailStatePreview;
  subject: string;
  to: MailsRecipients;
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

export interface MailsVisible {
  displayName: string;
  groupDisplayName: string;
  id: string;
  profile?: AccountType;
  structureName: string;
  type: MailsVisibleType;
}
