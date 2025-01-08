import { IMailsMailPreview, MailsRecipientInfo } from '~/framework/modules/mails/model';

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
      profile: string;
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
      profile: string;
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
      profile: string;
    }[];
  };
  unread: boolean;
}

export const mailsAdapter = (n: MailsMailPreviewBackend) => {
  const ret = {
    cc: { users: n.cc.users as MailsRecipientInfo[], groups: n.cc.groups as MailsRecipientInfo[] },
    cci: { users: n.cc.users as MailsRecipientInfo[], groups: n.cc.groups as MailsRecipientInfo[] },
    count: n.count,
    date: n.date,
    from: n.from as MailsRecipientInfo,
    hasAttachment: n.hasAttachment,
    id: n.id,
    response: n.response,
    state: n.state as 'SENT' | 'DRAFT',
    subject: n.subject,
    to: { users: n.cc.users as MailsRecipientInfo[], groups: n.cc.groups as MailsRecipientInfo[] },
    unread: n.unread,
  };
  return ret as IMailsMailPreview;
};

export interface MailsMailContentBackend {
  attachments: any[];
  body: string;
  cc: string[];
  ccName: any; // ???
  cci: string[];
  cciName: string[]; // ???
  date: number;
  displayNames: [string, string, boolean][]; // pq ?
  from: string;
  fromName: any; // Voir ce que c'est
  id: string;
  language: string;
  parent_id: any; // ??
  state: string; // "SENT" ou ??
  subject: string;
  text_searchable: string; // ??
  thread_id: string;
  to: string[];
  toName: any; // Voir ce que c'est
}

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
