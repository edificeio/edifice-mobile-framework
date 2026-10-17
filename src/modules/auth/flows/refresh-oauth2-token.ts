import { refreshTokenForAccount } from '~/framework/util/oauth2';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Refreshes the oAuth2 tokens of the given account and updates the `accounts` store (the storage follows).
 * MUTATES THE ACCOUNT GIVEN AS PARAMETER WITH THE NEW TOKENS, so that requests being built with it use the new ones.
 */
export const refreshOAuth2Token = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  const tokens = await refreshTokenForAccount(account);
  account.tokens = tokens;
  useAccountsStore.getState().refreshToken(account.user.id, tokens);
};
