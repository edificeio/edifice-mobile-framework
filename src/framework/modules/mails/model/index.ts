import { AccountType } from '~/framework/modules/auth/model';

export enum MailsDefaultFolders {
  DRAFTS = 'drafts',
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
  type: AccountType;
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

export interface IMailsMailPreview {
  cc: MailsRecipientInfo[];
  cci: MailsRecipientInfo[];
  date: number;
  from: MailsRecipientInfo;
  hasAttachment: boolean;
  id: string;
  state: string;
  subject: string;
  to: MailsRecipientInfo[];
  type: string;
  unread: boolean;
}

export interface IMailsFolder {
  depth: number;
  id: string;
  name: string;
  nbUnread: number;
  parent_id: string | null;
  skip_uniq: boolean;
  trashed: boolean;
  user_id: string;
  subfolders?: IMailsFolder[];
}

export interface MailsFolderInfo {
  id: string;
  name: string;
}
