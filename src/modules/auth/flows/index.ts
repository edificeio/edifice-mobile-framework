/**
 * Auth flows: the public use cases of the module, the ones to call from the outside.
 * All of them come from `createAuthFlows`, through `useAuthFlows()` (see `AuthSessionProvider`): the ones that start or end a session
 * depend on the modules, whose hooks they call. The `refresh*` of the tokens don't, but are forwarded too, so there is one way to get a flow.
 * The only direct exports below are for the code that can't use a hook (the transport, the legacy thunks).
 * Each one orchestrates services (network), stores (state, persisted by the accounts store) and side effects (notifications...).
 *
 * # Lifecycle of the connected account (`AuthStage`, see `store/accounts.ts`)
 *
 *   signedOut --sign in--> requirement --fulfilled--> signedIn
 *        |                                                ^
 *        +------------------ sign in (no requirement) ----+
 *
 * - `signedOut`: no connected account.
 * - `requirement`: the account is signed in and saved, but the platform asks something first (new terms, new password...).
 *   Only one requirement at a time, the first one the service finds (`service/requirements.ts`). Its session has NOT started:
 *   the effects of `startSession` did not run (notifications, apps, `callAtLogin` callbacks...), and only auth screens can show.
 *   Once the user did what is asked, `refreshRequirements` checks again: either another requirement comes, or none is left.
 * - `signedIn`: the session started (`startSession`) and the app can be used. Use `getSession()` to get it:
 *   it returns nothing before that, so code that needs a session never gets an unfinished one.
 *   Only code that must handle both (logout, requirement screens) uses `getActiveAccount()`.
 */

import React from 'react';

import type { SessionLifecycle } from '~/modules/auth/lifecycle';

import { createChangePassword } from './change-password';
import { createChangePasswordRequirement } from './change-password-requirement';
import { createEndSession } from './end-session';
import { createLogout } from './logout';
import { refreshOAuth2Token } from './refresh-oauth2-token';
import { refreshOneSessionId } from './refresh-one-session-id';
import { refreshQueryParamToken } from './refresh-query-param-token';
import { createRefreshRequirements } from './refresh-requirements';
import { createRemoveAccount } from './remove-account';
import { createRestoreAccount } from './restore-account';
import { createRevalidateTerms } from './revalidate-terms';
import { createSetActiveAccount } from './set-active-account';
import { createSleepCurrentSession } from './sleep-current-session';
import { createStartSession } from './start-session';
import { createRestoreAtStartup } from './startup';

// For the code that can't use a hook (the transport, the legacy thunks)
export { refreshOAuth2Token, refreshOneSessionId, refreshQueryParamToken };

/**
 * All the flows, for the React code: `useAuthFlows()` is the one way to get them.
 * The ones that start or end a session call the hooks of the modules (`sessionSetup`, `onSessionStart`, `onSessionRelease`).
 * The others (`refresh*` of the tokens) don't need them: they are just forwarded, so a flow is never looked for elsewhere.
 * They are built once the modules are known: see `AuthSessionProvider` and `useAuthFlows()`.
 */
export const createAuthFlows = ({ lifecycle }: { lifecycle: SessionLifecycle }) => {
  const endSession = createEndSession(lifecycle);
  const sleepCurrentSession = createSleepCurrentSession(endSession);
  const setActiveAccount = createSetActiveAccount({
    endSession,
    runSetups: lifecycle.runSetups,
    sleepCurrentSession,
    startSession: createStartSession(lifecycle),
  });
  const restoreAccount = createRestoreAccount(setActiveAccount, sleepCurrentSession);
  const refreshRequirements = createRefreshRequirements(setActiveAccount);
  const changePassword = createChangePassword(setActiveAccount);
  const logout = createLogout(endSession);
  return {
    changePassword,
    changePasswordRequirement: createChangePasswordRequirement(changePassword, logout),
    logout,
    refreshOAuth2Token,
    refreshOneSessionId,
    refreshQueryParamToken,
    refreshRequirements,
    removeAccount: createRemoveAccount(lifecycle, logout),
    restoreAccount,
    restoreAtStartup: createRestoreAtStartup(restoreAccount),
    revalidateTerms: createRevalidateTerms(refreshRequirements),
    setActiveAccount,
  };
};

export type AuthFlows = ReturnType<typeof createAuthFlows>;

export const AuthFlowsContext = React.createContext<AuthFlows | undefined>(undefined);

/**
 * The flows, tied to the loaded modules: the way to get any of them (see `AuthSessionProvider`, that gives them).
 * Only inside the `AuthSessionProvider`.
 */
export const useAuthFlows = (): AuthFlows => {
  const flows = React.useContext(AuthFlowsContext);
  if (flows === undefined) throw new Error('[Auth]: `useAuthFlows` was called outside of the `AuthSessionProvider`.');
  return flows;
};
