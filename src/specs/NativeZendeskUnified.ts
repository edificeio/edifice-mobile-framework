import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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
  groupType?: string;
  groupIds?: number[];
  showContactOptions?: boolean;
}

export interface OpenNewTicketOptions {
  subject?: string;
  tags?: string[];
}

export interface PreChatFormFieldsStatus {
  nameFieldStatus?: string;
  emailFieldStatus?: string;
  phoneFieldStatus?: string;
  departmentFieldStatus?: string;
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

export interface Spec extends TurboModule {
  healthCheck(): Promise<string>;
  initialize(config: ZendeskConfig): Promise<boolean>;
  setAnonymousIdentity(options: SetAnonymousIdentityOptions): Promise<boolean>;
  setIdentity(jwt: string): Promise<boolean>;
  openHelpCenter(options: OpenHelpCenterOptions): Promise<void>;
  openTicket(ticketId: string): Promise<void>;
  openNewTicket(options: OpenNewTicketOptions): Promise<void>;
  listTickets(): Promise<void>;
  openArticle(articleId: string): Promise<void>;
  setHelpCenterLocaleOverride(locale: string): Promise<void>;
  changeTheme(color: string): Promise<void>;
  initializeChat(accountKey: string): Promise<void>;
  startChat(options: StartChatOptions): Promise<void>;
  startAnswerBot(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZendeskUnified');
