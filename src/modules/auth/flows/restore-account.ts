import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '../model';
import { signIn } from '../service';
import { setAccount } from './set-account';
import { useSignInStore } from '../store/sign-in';

/**
 * Signs the given saved account in with its saved tokens, no user interaction involved.
 * If it fails, the sign-in status is set to `restore` (the user will land on the login screen of the account, which shows the error)
 * and the error is thrown.
 */
export const restoreAccount = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  try {
    return await setAccount(await signIn.restore(account), account.user.id);
  } catch (e) {
    console.error('[Auth] Restore error :', e);
    const { setError, setStatus } = useSignInStore.getState();
    setStatus({
      accountId: account.user.id,
      platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
      type: 'restore',
    });
    // No `key`: the error will be displayed by the first visible screen
    setError({ info: e as Error, key: undefined });
    throw e;
  }
};
