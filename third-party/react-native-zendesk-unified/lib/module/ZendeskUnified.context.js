import React, { createContext, useContext } from 'react';
import { Zendesk } from '.';
/**
 * Context to provide the Zendesk instance to the ZendeskProvider
 */
export const ZendeskContext = /*#__PURE__*/createContext(undefined);

/**
 * Hook to get the Zendesk instance from the ZendeskContext
 */
export function useZendesk() {
  const context = useContext(ZendeskContext);
  if (!context) {
    throw new Error('useZendesk must be used within an ZendeskProvider');
  }
  return context;
}
/**
 * Provider to wrap your app with to get access to the Zendesk instance
 * @param children
 * @param zendeskConfig The {@link ZendeskConfig} to initialize the {@link Zendesk} instance with.
 */
export function ZendeskProvider({
  children,
  zendeskConfig
}) {
  const ZendeskInstance = new Zendesk(zendeskConfig);
  return /*#__PURE__*/React.createElement(ZendeskContext.Provider, {
    value: ZendeskInstance
  }, children);
}
//# sourceMappingURL=ZendeskUnified.context.js.map