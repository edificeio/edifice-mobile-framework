import { useZendesk, ZendeskContext, ZendeskProvider } from './ZendeskUnified.context';
import type { OpenHelpCenterOptions, OpenNewTicketOptions, PreChatFormFieldsStatus, PreChatFormFieldStatus, SetAnonymousIdentityOptions, StartChatOptions, ZendeskConfig } from './ZendeskUnified.types';
export declare class Zendesk {
    constructor(config: ZendeskConfig);
    /**
     * Indicates whether the module is working correctly.
     * This method is useful for testing the module after initialization.
     * If the module is not working correctly, an error will be returned.
     */
    healthCheck(): Promise<string>;
    /**
     * Sets an anonymous identity for the user using an email and/or name.
     */
    setAnonymousIdentity(options: SetAnonymousIdentityOptions): Promise<boolean>;
    /**
     * Sets the identity of the user using a JWT.
     * @param jwt The JWT to use for the identity.
     */
    setIdentity(jwt: string): Promise<boolean>;
    /**
     * Opens the Zendesk Help Center.
     */
    openHelpCenter(options: OpenHelpCenterOptions): Promise<void>;
    /**
     * Opens a ticket with the given ID.
     * @param ticketId The ID of the ticket to open.
     */
    openTicket(ticketId: string): Promise<void>;
    /**
     * Opens the ticket creation screen.
     */
    openNewTicket(options: OpenNewTicketOptions): Promise<void>;
    /**
     * Lets you show a list of the user's tickets. The user can review and update their tickets.
     */
    listTickets(): Promise<void>;
    /**
     * Opens an article with the given ID.
     * @param articleId The ID of the article to open.
     */
    openArticle(articleId: number): Promise<void>;
    /**
     * Overrides the device locale and forces the Help Center to a specific language.
     * @param locale
     */
    setHelpCenterLocaleOverride(locale: string): Promise<void>;
    /**
     * iOS only: Changes the color theme of the Zendesk Help Center.
     * @param color The color to change the theme to.
     **/
    changeTheme(color: string): Promise<void>;
    /**
     * Initializes the Zendesk Chat SDK.
     * @param accountKey The Zendesk account key.
     */
    initializeChat(accountKey: string): Promise<void>;
    /**
     * Opens the Zendesk Chat screen.
     */
    startChat(options?: StartChatOptions): Promise<void>;
    /**
     * Opens the Zendesk Answer Bot screen.
     */
    startAnswerBot(): Promise<void>;
}
export { useZendesk, ZendeskContext, ZendeskProvider };
export type { OpenHelpCenterOptions, OpenNewTicketOptions, PreChatFormFieldsStatus, PreChatFormFieldStatus, SetAnonymousIdentityOptions, StartChatOptions, ZendeskConfig, };
//# sourceMappingURL=index.d.ts.map