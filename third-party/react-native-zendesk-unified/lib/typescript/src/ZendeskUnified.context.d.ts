import React from 'react';
import type { ReactNode } from 'react';
import { Zendesk } from '.';
import type { ZendeskConfig } from './ZendeskUnified.types';
/**
 * Context to provide the Zendesk instance to the ZendeskProvider
 */
export declare const ZendeskContext: React.Context<Zendesk | undefined>;
/**
 * Hook to get the Zendesk instance from the ZendeskContext
 */
export declare function useZendesk(): Zendesk;
interface ZendeskContextProps {
    children: ReactNode;
    zendeskConfig: ZendeskConfig;
}
/**
 * Provider to wrap your app with to get access to the Zendesk instance
 * @param children
 * @param zendeskConfig The {@link ZendeskConfig} to initialize the {@link Zendesk} instance with.
 */
export declare function ZendeskProvider({ children, zendeskConfig, }: ZendeskContextProps): JSX.Element;
export {};
//# sourceMappingURL=ZendeskUnified.context.d.ts.map