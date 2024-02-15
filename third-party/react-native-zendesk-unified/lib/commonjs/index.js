"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zendesk = void 0;
Object.defineProperty(exports, "ZendeskContext", {
  enumerable: true,
  get: function () {
    return _ZendeskUnified.ZendeskContext;
  }
});
Object.defineProperty(exports, "ZendeskProvider", {
  enumerable: true,
  get: function () {
    return _ZendeskUnified.ZendeskProvider;
  }
});
Object.defineProperty(exports, "useZendesk", {
  enumerable: true,
  get: function () {
    return _ZendeskUnified.useZendesk;
  }
});
var _reactNative = require("react-native");
var _ZendeskUnified = require("./ZendeskUnified.context");
var _ZendeskUnified2 = require("./ZendeskUnified.module");
class Zendesk {
  constructor(config) {
    _ZendeskUnified2.ZendeskUnified.initialize(config);
  }

  /**
   * Indicates whether the module is working correctly.
   * This method is useful for testing the module after initialization.
   * If the module is not working correctly, an error will be returned.
   */
  async healthCheck() {
    return _ZendeskUnified2.ZendeskUnified.healthCheck();
  }

  /**
   * Sets an anonymous identity for the user using an email and/or name.
   */
  async setAnonymousIdentity(options) {
    return _ZendeskUnified2.ZendeskUnified.setAnonymousIdentity(options);
  }

  /**
   * Sets the identity of the user using a JWT.
   * @param jwt The JWT to use for the identity.
   */
  async setIdentity(jwt) {
    return _ZendeskUnified2.ZendeskUnified.setIdentity(jwt);
  }

  /**
   * Opens the Zendesk Help Center.
   */
  async openHelpCenter(options) {
    await _ZendeskUnified2.ZendeskUnified.openHelpCenter(options);
  }

  /**
   * Opens a ticket with the given ID.
   * @param ticketId The ID of the ticket to open.
   */
  async openTicket(ticketId) {
    await _ZendeskUnified2.ZendeskUnified.openTicket(ticketId);
  }

  /**
   * Opens the ticket creation screen.
   */
  async openNewTicket(options) {
    await _ZendeskUnified2.ZendeskUnified.openNewTicket(options);
  }

  /**
   * Lets you show a list of the user's tickets. The user can review and update their tickets.
   */
  async listTickets() {
    await _ZendeskUnified2.ZendeskUnified.listTickets();
  }

  /**
   * Opens an article with the given ID.
   * @param articleId The ID of the article to open.
   */
  async openArticle(articleId) {
    await _ZendeskUnified2.ZendeskUnified.openArticle(_reactNative.Platform.OS === 'ios' ? articleId.toString() : articleId);
  }

  /**
   * Overrides the device locale and forces the Help Center to a specific language.
   * @param locale
   */
  async setHelpCenterLocaleOverride(locale) {
    await _ZendeskUnified2.ZendeskUnified.setHelpCenterLocaleOverride(locale);
  }

  /**
   * iOS only: Changes the color theme of the Zendesk Help Center.
   * @param color The color to change the theme to.
   **/
  async changeTheme(color) {
    await _ZendeskUnified2.ZendeskUnified.changeTheme(color);
  }

  /**
   * Initializes the Zendesk Chat SDK.
   * @param accountKey The Zendesk account key.
   */
  async initializeChat(accountKey) {
    await _ZendeskUnified2.ZendeskUnified.initializeChat(accountKey);
  }

  /**
   * Opens the Zendesk Chat screen.
   */
  async startChat(options) {
    await _ZendeskUnified2.ZendeskUnified.startChat(options);
  }

  /**
   * Opens the Zendesk Answer Bot screen.
   */
  async startAnswerBot() {
    await _ZendeskUnified2.ZendeskUnified.startAnswerBot();
  }
}
exports.Zendesk = Zendesk;
//# sourceMappingURL=index.js.map