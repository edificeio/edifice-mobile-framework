export type IBackendAttachment = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
};

export type IBackendFolder = {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: IBackendFolder[];
};

export type IBackendMail = {
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

export type IBackendQuota = {
  storage: number;
  quota: string;
};

export type IBackendRecipient = {
  id: string;
  displayName?: string;
  name?: string;
  groupDisplayName: string | null;
  profile: string | null;
  structureName: string | null;
};

export type IBackendRecipientDirectory = {
  groups: IBackendRecipient[];
  users: IBackendRecipient[];
};

export type IBackendSignature = {
  preference: string;
  zimbraENTSignatureExists: boolean;
  id: string;
};

type IBackendUser = {
  id: string;
  displayName: string;
  type: string[];
};

export type IBackendFolderList = IBackendFolder[];
export type IBackendMailList = Omit<IBackendMail, 'body'>[];
export type IBackendUserList = IBackendUser[];
