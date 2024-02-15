import { Platform } from 'react-native';
import {
  useZendesk,
  ZendeskContext,
  ZendeskProvider,
} from './ZendeskUnified.context';
import { ZendeskUnified } from './ZendeskUnified.module';
import type {
  OpenHelpCenterOptions,
  OpenNewTicketOptions,
  PreChatFormFieldsStatus,
  PreChatFormFieldStatus,
  SetAnonymousIdentityOptions,
  StartChatOptions,
  ZendeskConfig,
} from './ZendeskUnified.types';

export class Zendesk {
  constructor(config: ZendeskConfig) {
    ZendeskUnified.initialize(config);
  }

  /**
   * Indicates whether the module is working correctly.
   * This method is useful for testing the module after initialization.
   * If the module is not working correctly, an error will be returned.
   */
  public async healthCheck(): Promise<string> {
    return ZendeskUnified.healthCheck();
  }

  /**
   * Sets an anonymous identity for the user using an email and/or name.
   */
  public async setAnonymousIdentity(
    options: SetAnonymousIdentityOptions
  ): Promise<boolean> {
    return ZendeskUnified.setAnonymousIdentity(options);
  }

  /**
   * Sets the identity of the user using a JWT.
   * @param jwt The JWT to use for the identity.
   */
  public async setIdentity(jwt: string): Promise<boolean> {
    return ZendeskUnified.setIdentity(jwt);
  }

  /**
   * Opens the Zendesk Help Center.
   */
  public async openHelpCenter(options: OpenHelpCenterOptions) {
    await ZendeskUnified.openHelpCenter(options);
  }

  /**
   * Opens a ticket with the given ID.
   * @param ticketId The ID of the ticket to open.
   */
  public async openTicket(ticketId: string) {
    await ZendeskUnified.openTicket(ticketId);
  }

  /**
   * Opens the ticket creation screen.
   */
  public async openNewTicket(options: OpenNewTicketOptions) {
    await ZendeskUnified.openNewTicket(options);
  }

  /**
   * Lets you show a list of the user's tickets. The user can review and update their tickets.
   */
  public async listTickets() {
    await ZendeskUnified.listTickets();
  }

  /**
   * Opens an article with the given ID.
   * @param articleId The ID of the article to open.
   */
  public async openArticle(articleId: number) {
    await ZendeskUnified.openArticle(
      Platform.OS === 'ios' ? articleId.toString() : articleId
    );
  }

  /**
   * Overrides the device locale and forces the Help Center to a specific language.
   * @param locale
   */
  public async setHelpCenterLocaleOverride(locale: string) {
    await ZendeskUnified.setHelpCenterLocaleOverride(locale);
  }

  /**
   * iOS only: Changes the color theme of the Zendesk Help Center.
   * @param color The color to change the theme to.
   **/
  public async changeTheme(color: string) {
    await ZendeskUnified.changeTheme(color);
  }

  /**
   * Initializes the Zendesk Chat SDK.
   * @param accountKey The Zendesk account key.
   */
  public async initializeChat(accountKey: string) {
    await ZendeskUnified.initializeChat(accountKey);
  }

  /**
   * Opens the Zendesk Chat screen.
   */
  public async startChat(options?: StartChatOptions) {
    await ZendeskUnified.startChat(options);
  }

  /**
   * Opens the Zendesk Answer Bot screen.
   */
  public async startAnswerBot() {
    await ZendeskUnified.startAnswerBot();
  }
}

export { useZendesk, ZendeskContext, ZendeskProvider };
export type {
  OpenHelpCenterOptions,
  OpenNewTicketOptions,
  PreChatFormFieldsStatus,
  PreChatFormFieldStatus,
  SetAnonymousIdentityOptions,
  StartChatOptions,
  ZendeskConfig,
};
