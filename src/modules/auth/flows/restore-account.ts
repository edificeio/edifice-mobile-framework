import { accountIsLoggable, type AuthActiveAccount, type AuthSavedAccount } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import track, { withTracking } from '~/modules/auth/tracking';

import type { SetActiveAccount } from './set-active-account';
import type { SleepCurrentSession } from './sleep-current-session';

export interface RestoreAccountOptions {
  /** Called when the account can't be signed in, before the connected session is put to sleep (see `createRestoreAccount`). */
  beforeLeave?: () => void | Promise<void>;
}

/**
 * Makes the given saved account the connected one, using its saved tokens, no user interaction involved.
 * Used to sign in again at startup, from the accounts selector, and to switch account (the connected one is put to sleep).
 *
 * If the account can't be signed in with its saved tokens (it has none, or the sign-in fails), the sign-in status is set to
 * `login`: the user lands on the login screen of the account, filled in, with the error if any. The connected account (if any)
 * is put to sleep anyway, so the choice of leaving it is kept. The status only tells what to show now: it is not saved. What the app
 * resumes at next launch is the `startup` of the accounts store, which only a successful sign-in sets: after a failed switch it is
 * empty (the accounts selector shows), and after a restore that failed at launch it still is the account that was tried.
 * No error is thrown: the situation is told by the stores.
 * `beforeLeave` is called (and awaited) when the account can't be signed in, after the status is set and before the connected
 * session is put to sleep: it lets the caller get out of the way of the transition to the sign-in screens (a sheet to close...).
 * It is not called if the account is signed in.
 * @returns the signed-in account, or undefined if the user has to sign in again.
 */
export const createRestoreAccount = (setActiveAccount: SetActiveAccount, sleepCurrentSession: SleepCurrentSession) => {
  /** Status first, so the sign-in screens are already told where to go when the end of the session sends the user to them. */
  const leaveForRestore = async (
    account: AuthSavedAccount | AuthActiveAccount,
    options?: RestoreAccountOptions,
    error?: unknown,
  ) => {
    const { setError, setStatus } = useSignInStore.getState();
    setStatus({
      accountId: account.user.id,
      platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
      type: 'login',
    });
    // No `key`: the error will be displayed by the first visible screen
    if (error) setError({ info: error as Error, key: undefined });
    try {
      await options?.beforeLeave?.();
    } catch (e) {
      // Not worth stopping the user from reaching the sign-in screens
      console.warn('[Auth] beforeLeave failed :', e);
    }
    sleepCurrentSession();
  };

  return async (account: AuthSavedAccount | AuthActiveAccount, options?: RestoreAccountOptions) => {
    if (!accountIsLoggable(account)) {
      await leaveForRestore(account, options);
      return undefined;
    }
    try {
      return await withTracking(track.loginRestore, async () =>
        setActiveAccount(await service.signIn.restore(account), account.user.id),
      );
    } catch (e) {
      console.error('[Auth] Restore error :', e);
      await leaveForRestore(account, options, e);
      return undefined;
    }
  };
};
