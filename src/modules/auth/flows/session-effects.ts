/**
 * Effects that come with the start/end of a session, shared by the flows that change the connected account.
 * Keep them here to see at a glance everything that happens when a session starts or ends.
 */

import { audienceService } from '~/framework/modules/audience/service';
// import { appInfoActions } from '~/framework/modules/myapps/reducer/actions';
// import { loadAppsDataFromService } from '~/framework/modules/myapps/reducer/adapter';
// import { createMyAppsServiceWithTokenFetch } from '~/framework/modules/myapps/service';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import { Trackers } from '~/framework/util/tracker';

import { callRegisteredActionsAtLogin } from '../calls-at-login';
import type { AuthActiveAccount } from '../model';
import { dispatchToLegacyStore } from './legacy-redux';
import { refreshOneSessionId } from './refresh-one-session-id';
import { notifications } from '../service/notifications';
import { getSession, useAccountsStore } from '../store/accounts';
import { usePlatformReactionTypesStore } from '../store/platform-reaction-types';

/**
 * Loads what the app needs before it can be shown to the user, and that the session must provide.
 * Called BEFORE the session is committed to the store: if it fails, the sign-in fails and nothing was changed.
 *
 * ToDo: MyApps data is loaded at login then enriched with module info, it belongs to `myapps` (use `callAtLogin`).
 */
export const prepareSession = async (session: AuthActiveAccount) => {
  // Note: this doesn't work for the moment (AllModules changes breakling things.)
  // We skip it until myapps is migrated.
  //
  // const myAppsServiceWithTokens = createMyAppsServiceWithTokenFetch(session.tokens);
  // const payload = await loadAppsDataFromService(myAppsServiceWithTokens, session);
  // dispatchToLegacyStore(appInfoActions.fetchSuccess(payload));
};

/**
 * Sets up everything that depends on the session. Called AFTER the session is committed to the store.
 */
export const startSession = async (session: AuthActiveAccount) => {
  Trackers.setUserId(session.user.id);
  Trackers.setCustomDimension(1, 'Profile', session.user.type.toString());
  Trackers.setCustomDimension(3, 'Project', new URL(session.platform.url).hostname);

  // Setup push-notifications for the account. No `await` as it is non-blocking for login process
  notifications.enableForAccount(session);

  // Call registered callbacks at login
  callRegisteredActionsAtLogin();

  // GET the audience valid reaction types for the platform
  // ToDo : Get this out of there ! This needs to be in the `audience` module and called with `callAtLogin`.
  audienceService.reaction
    .getValidReactionTypes()
    .then(types => usePlatformReactionTypesStore.getState().setReactionTypes(session.platform.name, types['reaction-types']))
    .catch(e => console.warn('[Auth] Unable to load valid reaction types:', e));

  // Refresh oneSessionId token
  await refreshOneSessionId(session);
};

/**
 * Puts the connected account (if any) to sleep: its notifications are disabled and the data of the session are flushed,
 * but it stays in the accounts with its tokens.
 */
export const sleepCurrentSession = async () => {
  const session = getSession();
  if (!session) return;
  await notifications.disableForAccount(session);
  dispatchToLegacyStore(createEndSessionAction()); // flush sessionReducers of not yet migrated modules
  useAccountsStore.getState().sleep();
};
