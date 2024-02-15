import { Platform } from 'react-native';
import { useZendesk, ZendeskContext, ZendeskProvider } from './ZendeskUnified.context';
import { ZendeskUnified } from './ZendeskUnified.module';
export class Zendesk {
  constructor(config) {
    ZendeskUnified.initialize(config);
  }

  /**
   * Indicates whether the module is working correctly.
   * This method is useful for testing the module after initialization.
   * If the module is not working correctly, an error will be returned.
   */
  async healthCheck() {
    return ZendeskUnified.healthCheck();
  }

  /**
   * Sets an anonymous identity for the user using an email and/or name.
   */
  async setAnonymousIdentity(options) {
    return ZendeskUnified.setAnonymousIdentity(options);
  }

  /**
   * Sets the identity of the user using a JWT.
   * @param jwt The JWT to use for the identity.
   */
  async setIdentity(jwt) {
    return ZendeskUnified.setIdentity(jwt);
  }

  /**
   * Opens the Zendesk Help Center.
   */
  async openHelpCenter(options) {
    await ZendeskUnified.openHelpCenter(options);
  }

  /**
   * Opens a ticket with the given ID.
   * @param ticketId The ID of the ticket to open.
   */
  async openTicket(ticketId) {
    await ZendeskUnified.openTicket(ticketId);
  }

  /**
   * Opens the ticket creation screen.
   */
  async openNewTicket(options) {
    await ZendeskUnified.openNewTicket(options);
  }

  /**
   * Lets you show a list of the user's tickets. The user can review and update their tickets.
   */
  async listTickets() {
    await ZendeskUnified.listTickets();
  }

  /**
   * Opens an article with the given ID.
   * @param articleId The ID of the article to open.
   */
  async openArticle(articleId) {
    await ZendeskUnified.openArticle(Platform.OS === 'ios' ? articleId.toString() : articleId);
  }

  /**
   * Overrides the device locale and forces the Help Center to a specific language.
   * @param locale
   */
  async setHelpCenterLocaleOverride(locale) {
    await ZendeskUnified.setHelpCenterLocaleOverride(locale);
  }

  /**
   * iOS only: Changes the color theme of the Zendesk Help Center.
   * @param color The color to change the theme to.
   **/
  async changeTheme(color) {
    await ZendeskUnified.changeTheme(color);
  }

  /**
   * Initializes the Zendesk Chat SDK.
   * @param accountKey The Zendesk account key.
   */
  async initializeChat(accountKey) {
    await ZendeskUnified.initializeChat(accountKey);
  }

  /**
   * Opens the Zendesk Chat screen.
   */
  async startChat(options) {
    await ZendeskUnified.startChat(options);
  }

  /**
   * Opens the Zendesk Answer Bot screen.
   */
  async startAnswerBot() {
    await ZendeskUnified.startAnswerBot();
  }
}
export { useZendesk, ZendeskContext, ZendeskProvider };
//# sourceMappingURL=index.js.map