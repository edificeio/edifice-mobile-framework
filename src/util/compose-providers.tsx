/**
 * Providers
 * Enables all transversal dependency injection while flattening the React Provider tree
 */

import React from 'react';

export type ProviderEntry<ProviderProps extends React.PropsWithChildren = Required<React.PropsWithChildren>> =
  [React.ComponentType<ProviderProps>, Omit<ProviderProps, 'children'>] | [React.ComponentType<ProviderProps>];

type ProviderOwnProps<ProviderProps> = Omit<ProviderProps, 'children'>;

/**
 * Props argument of `provider()`: optional only if the provider has no required props (other than `children`).
 */
type ProviderPropsArgs<ProviderProps> =
  {} extends ProviderOwnProps<ProviderProps> ? [props?: ProviderOwnProps<ProviderProps>] : [props: ProviderOwnProps<ProviderProps>];

/**
 * Declares a provider entry, type-checking its props against the provider component.
 */
export const provider = <ProviderProps extends React.PropsWithChildren>(
  Component: React.ComponentType<ProviderProps>,
  ...[props]: ProviderPropsArgs<ProviderProps>
) => (props === undefined ? [Component] : [Component, props]) as unknown as ProviderEntry;

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
