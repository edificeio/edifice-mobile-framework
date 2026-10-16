import { isTokenExpired } from '~/framework/util/oauth2';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { getQueryParamToken } from '~/modules/auth/service/token';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Gets the query param token of the account (a new one if absent or expired) and puts it into the `accounts` store.
 */
export const refreshQueryParamToken = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  if (account.tokens.queryParam && !isTokenExpired(account.tokens.queryParam)) {
    return account.tokens.queryParam;
  }
  const queryParam = await getQueryParamToken(account);
  useAccountsStore.getState().setQueryParamToken(account.user.id, queryParam);
  return queryParam;
};
