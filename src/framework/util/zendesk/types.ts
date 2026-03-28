export interface ZendeskConfig {
  appId?: string;
  clientId?: string;
  zendeskUrl?: string;
  accountKey?: string;
}

export interface SetAnonymousIdentityOptions {
  email?: string;
  name?: string;
}

export interface OpenHelpCenterOptions {
  labels?: string[];
  groupType?: 'category' | 'section';
  groupIds?: number[];
  showContactOptions?: boolean;
}

export interface OpenNewTicketOptions {
  subject?: string;
  tags?: string[];
  customFields?: Record<number, string>;
}

export type PreChatFormFieldStatus = 'required' | 'optional' | 'hidden';

export interface PreChatFormFieldsStatus {
  nameFieldStatus?: PreChatFormFieldStatus;
  emailFieldStatus?: PreChatFormFieldStatus;
  phoneFieldStatus?: PreChatFormFieldStatus;
  departmentFieldStatus?: PreChatFormFieldStatus;
}

export interface StartChatOptions {
  botName?: string;
  multilineResponseOptionsEnabled?: boolean;
  agentAvailabilityEnabled?: boolean;
  transcriptEnabled?: boolean;
  offlineFormsEnabled?: boolean;
  preChatFormEnabled?: boolean;
  preChatFormFieldsStatus?: PreChatFormFieldsStatus;
}
