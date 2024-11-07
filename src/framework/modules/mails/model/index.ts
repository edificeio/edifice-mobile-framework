export enum MailsDefaultFolders {
  DRAFTS = 'drafts',
  INBOX = 'inbox',
  OUTBOX = 'outbox',
  TRASH = 'trash',
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
  cc: { id: string; displayName: string; type: string }[];
  cci: { id: string; displayName: string; type: string }[];
  date: number;
  from: { id: string; displayName: string; type: string };
  id: string;
  language: string;
  parent_id: string;
  state: string;
  subject: string;
  text_searchable: string;
  thread_id: string;
  to: { id: string; displayName: string; type: string }[];
}

export interface IMailsMailPreview {
  cc: { id: string; displayName: string; type: string }[];
  cci: { id: string; displayName: string; type: string }[];
  date: number;
  from: { id: string; displayName: string; type: string };
  hasAttachment: boolean;
  id: string;
  state: string;
  subject: string;
  to: { id: string; displayName: string; type: string }[];
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
