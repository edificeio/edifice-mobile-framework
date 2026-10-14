import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '../model';
import { getOneSessionId } from '../service/token';
import { useAccountsStore } from '../store/accounts';

/**
 * Gets a new oneSessionId (cookie) for the account and puts it into the `accounts` store.
 */
export const refreshOneSessionId = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  const oneSessionId = await getOneSessionId(account);
  useAccountsStore.getState().setOneSessionId(account.user.id, oneSessionId);
  return oneSessionId;
};
