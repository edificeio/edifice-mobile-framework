import { audienceService } from '~/framework/modules/audience/service';
import { Trackers } from '~/framework/util/tracker';
import { getCallsAtLogin } from '~/modules/auth/calls-at-login';
import type { SessionLifecycle } from '~/modules/auth/lifecycle';
import { accountIsLoggable, type AuthActiveAccount, type AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { usePlatformReactionTypesStore } from '~/modules/auth/store/platform-reaction-types';

/**
 * Gives `startSession`: sets up everything that depends on the session. Not a flow of its own: it ends `setActiveAccount`.
 * Called AFTER the session is committed to the store.
 * `releasedId` is the account that was just released (it was the previous session), so not again.
 */
export const createStartSession = (lifecycle: SessionLifecycle) => {
  /** The accounts other than the one of the session, that may have left something: the ones that still can sign a request. */
  const accountsToReconcile = (sessionId: string, exceptId?: string) =>
    Object.values(useAccountsStore.getState().accounts).filter(
      (account): account is AuthSavedLoggedInAccount =>
        account.user.id !== sessionId && account.user.id !== exceptId && accountIsLoggable(account),
    );

  return async (session: AuthActiveAccount, releasedId?: string) => {
    Trackers.setUserId(session.user.id);
    Trackers.setCustomDimension(1, 'Profile', session.user.type.toString());
    Trackers.setCustomDimension(3, 'Project', new URL(session.platform.url).hostname);

    // Tell the modules (`onSessionStart`)
    lifecycle.start(session);
    // @todo remove this in favor of lifecycle.start (usage with onSessionStart)
    // @deprecated `callAtLogin`, for the code that is not a module (not ordered, not awaited, failures only logged)
    for (const callback of getCallsAtLogin()) {
      Promise.resolve()
        .then(callback)
        .catch(e => console.warn('[Auth] callAtLogin failed:', e));
    }
    // The other accounts that may have left something are released (a release that failed or never ran, because the app was killed,
    // is replayed here)
    for (const account of accountsToReconcile(session.user.id, releasedId)) lifecycle.release(account);

    // ToDo: the MyApps data (loaded at login then enriched with module info) belongs to `myapps`, with `sessionSetup`.

    // GET the audience valid reaction types for the platform
    // ToDo : Get this out of there ! This needs to be in the `audience` module and called with `callAtLogin`.
    audienceService.reaction
      .getValidReactionTypes()
      .then(types => usePlatformReactionTypesStore.getState().setReactionTypes(session.platform.name, types['reaction-types']))
      .catch(e => console.warn('[Auth] Unable to load valid reaction types:', e));
  };
};

export type StartSession = ReturnType<typeof createStartSession>;
