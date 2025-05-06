import { AccountType } from '~/framework/modules/auth/model';
import {
  IMailsMailAttachment,
  IMailsMailContent,
  IMailsMailPreview,
  MailsMailStatePreview,
  MailsRecipientGroupInfo,
  MailsRecipientInfo,
  MailsVisible,
  MailsVisibleType,
} from '~/framework/modules/mails/model';

export interface MailsMailPreviewBackend {
  cc: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  cci: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  count: number;
  date: number;
  from: {
    id: string;
    displayName: string;
    profile: string;
  };
  hasAttachment: boolean;
  id: string;
  response: boolean;
  state: string;
  subject: string;
  to: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  unread: boolean;
}

export const mailsAdapter = (n: MailsMailPreviewBackend) => {
  const ret = {
    cc: { groups: n.cc.groups as MailsRecipientGroupInfo[], users: n.cc.users as MailsRecipientInfo[] },
    cci: { groups: n.cci.groups as MailsRecipientGroupInfo[], users: n.cci.users as MailsRecipientInfo[] },
    count: n.count,
    date: n.date,
    from: n.from as MailsRecipientInfo,
    hasAttachment: n.hasAttachment,
    id: n.id,
    response: n.response,
    state: n.state as MailsMailStatePreview,
    subject: n.subject,
    to: { groups: n.to.groups as MailsRecipientGroupInfo[], users: n.to.users as MailsRecipientInfo[] },
    unread: n.unread,
  };
  return ret as IMailsMailPreview;
};

export interface MailsMailContentBackend {
  attachments: {
    id: string;
    name: string;
    charset: string;
    filename: string;
    contentType: string;
    contentTransferEncoding: string;
    size: number;
  }[];
  body: string;
  cc: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  cci: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  date: number;
  folder_id: string | null;
  from: {
    id: string;
    displayName: string;
    profile: string;
  };
  language: string;
  id: string;
  parent_id: string | null;
  state: string;
  subject: string;
  original_format_exists: boolean;
  thread_id: string;
  to: {
    users: {
      id: string;
      displayName: string;
      profile: string;
    }[];
    groups: {
      id: string;
      displayName: string;
      size: number;
      type: string;
      subType: string;
    }[];
  };
  trashed: boolean;
  unread: boolean;
}

export const mailContentAdapter = (n: MailsMailContentBackend) => {
  const ret = {
    attachments: n.attachments as IMailsMailAttachment[],
    body: n.body,
    cc: { groups: n.cc.groups as MailsRecipientGroupInfo[], users: n.cc.users as MailsRecipientInfo[] },
    cci: { groups: n.cci.groups as MailsRecipientGroupInfo[], users: n.cci.users as MailsRecipientInfo[] },
    date: n.date,
    folder_id: n.folder_id,
    from: n.from as MailsRecipientInfo,
    id: n.id,
    language: n.language,
    original_format_exists: n.original_format_exists,
    parent_id: n.parent_id,
    state: n.state as MailsMailStatePreview,
    subject: n.subject,
    thread_id: n.thread_id,
    to: { groups: n.to.groups as MailsRecipientGroupInfo[], users: n.to.users as MailsRecipientInfo[] },
    trashed: n.trashed,
    unread: n.unread,
  };
  return ret as IMailsMailContent;
};

export interface MailsVisibleBackend {
  id: string;
  displayName: string;
  profile: string;
  nbUsers?: number;
  groupType?: string;
  usedIn: ('TO' | 'CC' | 'CCI')[];
  type: 'User' | 'Group' | 'ShareBookmark';
  children?: { id: string; displayName: string }[];
  relatives?: { id: string; displayName: string }[];
}

export const mailVisibleAdapter = (n: MailsVisibleBackend) => {
  const ret = {
    displayName: n.displayName,
    id: n.id,
    profile: n.profile as AccountType,
    type: n.type as MailsVisibleType,
    ...(n.nbUsers && { nbUsers: n.nbUsers }),
    ...(n.groupType && { groupType: n.groupType }),
    ...(n.children && { children: n.children }),
    ...(n.relatives && { relatives: n.relatives }),
  };
  return ret as MailsVisible;
};

export interface MailsGroupBookmarkBackend {
  id: string;
  name: string;
  nbUsers: number;
  activationCode: boolean;
  groupType: string;
  profile: string;
  sortName: string;
}

export interface MailsUserBookmarkBackend {
  id: string;
  displayName: string;
  profile: string;
  activationCode: boolean;
}

export interface MailsBookmarkBackend {
  id: string;
  name: string;
  groups: MailsGroupBookmarkBackend[];
  users: MailsUserBookmarkBackend[];
}

export const mailGroupBookmarkAdapter = (n: MailsGroupBookmarkBackend) => {
  const ret = {
    displayName: n.name,
    id: n.id,
    type: MailsVisibleType.GROUP,
  };
  return ret as MailsVisible;
};

export const mailUserBookmarkAdapter = (n: MailsUserBookmarkBackend) => {
  const ret = {
    displayName: n.displayName,
    id: n.id,
    profile: n.profile as AccountType,
    type: MailsVisibleType.USER,
  };
  return ret as MailsVisible;
};
