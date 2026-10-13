import React from 'react';

import { useModules } from '~/app/module/loader';
import { AuthFlowsContext, createAuthFlows } from '~/modules/auth/flows';
import { createSessionLifecycle } from '~/modules/auth/lifecycle';

/**
 * Gives the flows that start or end a session (`useAuthFlows`), tied to the hooks of the loaded modules (`sessionSetup`,
 * `onSessionStart`, `onSessionRelease`).
 * Declared in `app/providers.ts`, so inside the `ModuleLoader`, after the providers the hooks rely on (storage, redux, transport,
 * language) and above everything that can sign in (the app screens, the startup).
 */
export const AuthFlowsProvider = ({ children }: React.PropsWithChildren) => {
  const modules = useModules();
  const flows = React.useMemo(() => createAuthFlows({ lifecycle: createSessionLifecycle(modules) }), [modules]);
  return <AuthFlowsContext value={flows}>{children}</AuthFlowsContext>;
};
