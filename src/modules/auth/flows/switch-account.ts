import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '../model';
import { signIn } from '../service';
import { setAccount } from './set-account';

/**
 * Makes the given saved account the connected one, using its saved tokens.
 * The previously connected account is put to sleep. If anything fails, it stays connected and the error is thrown.
 */
export const switchAccount = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) =>
  setAccount(await signIn.restore(account), account.user.id);
