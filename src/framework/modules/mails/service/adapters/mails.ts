export interface MailsMailPreviewBackend {
  cc: string[];
  ccName: any; // ???
  cci: string[];
  cciName: string[]; // ???
  count: number; // ??
  date: number;
  displayNames: [string, string, boolean][]; // pq ?
  from: string;
  fromName: any; // Voir ce que c'est
  hasAttachment: boolean;
  id: string;
  response: boolean;
  state: string; // "SENT" ou ??
  subject: string;
  to: string[];
  toName: any; // Voir ce que c'est
  unread: boolean;
}

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

export interface MailsCountBackend {
  count: number;
}

export interface MailsFolderBackend {
  depth: number;
  id: string;
  name: string;
  nbUnread: number;
  parent_id: string;
  skip_uniq: boolean; // ??
  trashed: boolean;
  user_id: string;
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
