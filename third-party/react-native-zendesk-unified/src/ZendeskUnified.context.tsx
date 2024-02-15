import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Zendesk } from '.';
import type { ZendeskConfig } from './ZendeskUnified.types';

/**
 * Context to provide the Zendesk instance to the ZendeskProvider
 */
export const ZendeskContext = createContext<Zendesk | undefined>(undefined);

/**
 * Hook to get the Zendesk instance from the ZendeskContext
 */
export function useZendesk(): Zendesk {
  const context = useContext(ZendeskContext);

  if (!context) {
    throw new Error('useZendesk must be used within an ZendeskProvider');
  }

  return context;
}

interface ZendeskContextProps {
  children: ReactNode;
  zendeskConfig: ZendeskConfig;
}

/**
 * Provider to wrap your app with to get access to the Zendesk instance
 * @param children
 * @param zendeskConfig The {@link ZendeskConfig} to initialize the {@link Zendesk} instance with.
 */
export function ZendeskProvider({
  children,
  zendeskConfig,
}: ZendeskContextProps) {
  const ZendeskInstance = new Zendesk(zendeskConfig);

  return (
    <ZendeskContext.Provider value={ZendeskInstance}>
      {children}
    </ZendeskContext.Provider>
  );
}
