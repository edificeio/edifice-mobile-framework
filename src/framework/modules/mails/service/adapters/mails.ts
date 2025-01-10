import {
  IMailsMailAttachment,
  IMailsMailContent,
  IMailsMailPreview,
  MailsMailStatePreview,
  MailsRecipientGroupInfo,
  MailsRecipientInfo,
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
    cc: { users: n.cc.users as MailsRecipientInfo[], groups: n.cc.groups as MailsRecipientGroupInfo[] },
    cci: { users: n.cci.users as MailsRecipientInfo[], groups: n.cci.groups as MailsRecipientGroupInfo[] },
    count: n.count,
    date: n.date,
    from: n.from as MailsRecipientInfo,
    hasAttachment: n.hasAttachment,
    id: n.id,
    response: n.response,
    state: n.state as MailsMailStatePreview,
    subject: n.subject,
    to: { users: n.to.users as MailsRecipientInfo[], groups: n.to.groups as MailsRecipientGroupInfo[] },
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
}

export const mailContentAdapter = (n: MailsMailContentBackend) => {
  const ret = {
    attachments: n.attachments as IMailsMailAttachment[],
    body: n.body,
    cc: { users: n.cc.users as MailsRecipientInfo[], groups: n.cc.groups as MailsRecipientGroupInfo[] },
    cci: { users: n.cci.users as MailsRecipientInfo[], groups: n.cci.groups as MailsRecipientGroupInfo[] },
    date: n.date,
    from: n.from as MailsRecipientInfo,
    language: n.language,
    parent_id: n.parent_id,
    id: n.id,
    state: n.state as MailsMailStatePreview,
    subject: n.subject,
    thread_id: n.thread_id,
    to: { users: n.to.users as MailsRecipientInfo[], groups: n.to.groups as MailsRecipientGroupInfo[] },
  };
  return ret as IMailsMailContent;
};

export interface MailsVisiblesGroupsBackend {
  groups: {
    groupDisplayName: string; // ??
    id: string;
    name: string;
    profile: string; // ?? AdminLocal
    structureName: string;
  }[];
}

export interface MailsVisiblesUsersBackend {
  users: {
    displayName: string;
    groupDisplayName: string; // ??
    id: string;
    profile: string;
    structureName: string;
  }[];
}

// APPEL uniquement les 3 premières lettres, retour bizarre

export interface MailsVisiblesBackend {
  groups: MailsVisiblesGroupsBackend;
  users: MailsVisiblesUsersBackend;
}
