import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import type {
  OpenHelpCenterOptions,
  OpenNewTicketOptions,
  PreChatFormFieldsStatus,
  SetAnonymousIdentityOptions,
  StartChatOptions,
  ZendeskConfig,
} from '~/specs/NativeZendeskUnified';
import NativeZendeskUnified from '~/specs/NativeZendeskUnified';

export class Zendesk {
  constructor(config: ZendeskConfig) {
    NativeZendeskUnified.initialize(config);
  }

  public healthCheck(): Promise<string> {
    return NativeZendeskUnified.healthCheck();
  }

  public setAnonymousIdentity(options: SetAnonymousIdentityOptions): Promise<boolean> {
    return NativeZendeskUnified.setAnonymousIdentity(options);
  }

  public setIdentity(jwt: string): Promise<boolean> {
    return NativeZendeskUnified.setIdentity(jwt);
  }

  public openHelpCenter(options: OpenHelpCenterOptions): Promise<void> {
    return NativeZendeskUnified.openHelpCenter(options);
  }

  public openTicket(ticketId: string): Promise<void> {
    return NativeZendeskUnified.openTicket(ticketId);
  }

  public openNewTicket(options: OpenNewTicketOptions): Promise<void> {
    return NativeZendeskUnified.openNewTicket(options);
  }

  public listTickets(): Promise<void> {
    return NativeZendeskUnified.listTickets();
  }

  public openArticle(articleId: number): Promise<void> {
    return NativeZendeskUnified.openArticle(String(articleId));
  }

  public setHelpCenterLocaleOverride(locale: string): Promise<void> {
    return NativeZendeskUnified.setHelpCenterLocaleOverride(locale);
  }

  public changeTheme(color: string): Promise<void> {
    return NativeZendeskUnified.changeTheme(color);
  }

  public initializeChat(accountKey: string): Promise<void> {
    return NativeZendeskUnified.initializeChat(accountKey);
  }

  public startChat(options?: StartChatOptions): Promise<void> {
    return NativeZendeskUnified.startChat(options ?? {});
  }

  public startAnswerBot(): Promise<void> {
    return NativeZendeskUnified.startAnswerBot();
  }
}

export const ZendeskContext = createContext<Zendesk | undefined>(undefined);

export function useZendesk(): Zendesk | undefined {
  return useContext(ZendeskContext);
}

interface ZendeskProviderProps {
  children: ReactNode;
  zendeskConfig: ZendeskConfig;
}

export function ZendeskProvider({ children, zendeskConfig }: ZendeskProviderProps) {
  const instance = new Zendesk(zendeskConfig);
  return <ZendeskContext.Provider value={instance}>{children}</ZendeskContext.Provider>;
}

export type {
  OpenHelpCenterOptions,
  OpenNewTicketOptions,
  PreChatFormFieldsStatus,
  SetAnonymousIdentityOptions,
  StartChatOptions,
  ZendeskConfig,
};
