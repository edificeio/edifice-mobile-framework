/**
 * Providers
 * Enables all transversal dependency injection while flattening the React Provider tree
 */

import React from 'react';

export type ProviderEntry<ProviderProps extends Required<React.PropsWithChildren> = Required<React.PropsWithChildren>> =
  [React.ComponentType<ProviderProps>, Omit<ProviderProps, 'children'>] | [React.ComponentType<ProviderProps>];

interface ComposeProvidersProps extends Required<React.PropsWithChildren> {
  providers: ProviderEntry[];
}

export const ComposeProviders = React.memo(function ({ children, providers = [] }: ComposeProvidersProps) {
  return (
    <>
      {providers.reduceRight((acc, [Comp, props]) => {
        return <Comp {...props}>{acc}</Comp>;
      }, children)}
    </>
  );
});
ComposeProviders.displayName = 'ComposeProviders';
