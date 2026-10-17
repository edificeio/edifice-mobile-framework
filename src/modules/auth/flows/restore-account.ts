import { accountIsLoggable, type AuthActiveAccount, type AuthSavedAccount } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { useSignInStore } from '~/modules/auth/store/sign-in';
import track from '~/modules/auth/tracking';

import { sleepCurrentSession } from './session-effects';
import { setAccount } from './set-account';
import { withTracking } from './track';

/**
 * Makes the given saved account the connected one, using its saved tokens, no user interaction involved.
 * Used to sign in again at startup, from the accounts selector, and to switch account (the connected one is put to sleep).
 *
 * If the account can't be signed in with its saved tokens (it has none, or the sign-in fails), the sign-in status is set to
 * `restore`: the user lands on the login screen of the account, filled in, with the error if any. The connected account (if any)
 * is put to sleep anyway, so the choice of leaving it is kept: the account to restore at next launch is the one the user chose
 * (see `startup` in `store/accounts-persistence.ts`).
 * No error is thrown: the situation is told by the stores.
 * @returns the signed-in account, or undefined if the user has to sign in again.
 */
export const restoreAccount = async (account: AuthSavedAccount | AuthActiveAccount) => {
  if (!accountIsLoggable(account)) {
    await leaveForRestore(account);
    return undefined;
  }
  try {
    return await withTracking(track.loginRestore, async () => setAccount(await service.signIn.restore(account), account.user.id));
  } catch (e) {
    console.error('[Auth] Restore error :', e);
    await leaveForRestore(account, e);
    return undefined;
  }
};

/** Status first, so the sign-in screens are already told where to go when the end of the session sends the user to them. */
const leaveForRestore = async (account: AuthSavedAccount | AuthActiveAccount, error?: unknown) => {
  const { setError, setStatus } = useSignInStore.getState();
  setStatus({
    accountId: account.user.id,
    platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
    type: 'restore',
  });
  // No `key`: the error will be displayed by the first visible screen
  if (error) setError({ info: error as Error, key: undefined });
  await sleepCurrentSession();
};
