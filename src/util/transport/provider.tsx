import React from 'react';

import { useModuleScopes } from '~/app/module/hooks';

let GLOBAL_SCOPES: Set<string> = new Set();
/**
 *
 * @deprecated build useFetch hook to inject modules and scope information;
 */
export const getModulesScopes = () => GLOBAL_SCOPES;

export const TransportProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  // todo: build useFetch hook to inject modules and scope information
  const scopes = useModuleScopes();
  GLOBAL_SCOPES = scopes;
  console.info('SCOPES', GLOBAL_SCOPES);
  return <>{children}</>;
});
TransportProvider.displayName = 'TransportProvider';
