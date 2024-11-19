import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

import {
  OpenHelpCenterOptions,
  OpenNewTicketOptions,
  SetAnonymousIdentityOptions,
  StartChatOptions,
  ZendeskConfig,
} from '~/framework/util/zendesk';

export interface Spec extends TurboModule {
  changeTheme(color: string): void;
  healthCheck(): string;
  initialize(config: ZendeskConfig): void;
  initializeChat(accountKey: string): void;
  listTickets(): void;
  openArticle(articleId: number | string): void;
  openHelpCenter(options: OpenHelpCenterOptions): void;
  openNewTicket(options: OpenNewTicketOptions): void;
  openTicket(ticketId: string): void;
  openTicketList(): void;
  setAnonymousIdentity(options: SetAnonymousIdentityOptions): boolean;
  setHelpCenterLocaleOverride(locale: string): void;
  setIdentity(jwt: string): boolean;
  startChat(options?: StartChatOptions): void;
  startAnswerBot(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZendeskUnified');
