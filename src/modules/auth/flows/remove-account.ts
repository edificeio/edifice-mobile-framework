import type { SessionLifecycle } from '~/modules/auth/lifecycle';
import { accountIsLoggable, type AuthActiveAccount, type AuthSavedAccount } from '~/modules/auth/model';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { getActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';

import type { LogoutFlow } from './logout';

/**
 * Gives `removeAccount`: removes the account from the saved ones (and its preferences from the storage). Logs it out first if it is
 * the connected one.
 */
export const createRemoveAccount =
  (lifecycle: SessionLifecycle, logout: LogoutFlow) => async (account: AuthActiveAccount | AuthSavedAccount) => {
    if (getActiveAccount()?.user.id === account.user.id) await logout();
    // Its tokens are about to go: the last chance for the modules to undo what it left
    else if (accountIsLoggable(account)) lifecycle.release(account);
    useAccountsStore.getState().removeAccount(account.user.id);
    // Whatever situation the sign-in was in, the user now must choose again among the accounts left.
    useSignInStore.getState().reset();
  };
