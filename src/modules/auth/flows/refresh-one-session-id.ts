import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Gets a new oneSessionId (cookie) for the account and puts it into the `accounts` store.
 */
export const refreshOneSessionId = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  const oneSessionId = await service.getOneSessionId(account);
  useAccountsStore.getState().setOneSessionId(account.user.id, oneSessionId);
  return oneSessionId;
};
