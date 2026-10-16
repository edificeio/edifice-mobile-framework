import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';
import { getConnectedAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { logout } from './logout';

/**
 * Removes the account from the saved ones (and its preferences from the storage). Logs it out first if it is the connected one.
 */
export const removeAccount = async (account: AuthActiveAccount | AuthSavedAccount) => {
  if (getConnectedAccount()?.user.id === account.user.id) await logout();
  useAccountsStore.getState().removeAccount(account.user.id);
  // Whatever situation the sign-in was in, the user now must choose again among the accounts left.
  useSignInStore.getState().reset();
};
