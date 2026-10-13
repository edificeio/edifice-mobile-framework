import { refreshTokenForAccount } from '~/framework/util/oauth2';
import type { AuthActiveAccount, AuthSavedLoggedInAccount, AuthTokenSet } from '~/modules/auth/model';
import { getAccountWithTokens, useAccountsStore } from '~/modules/auth/store/accounts';

/** The refreshes that are running, by account id: there is never more than one for an account. */
const refreshing = new Map<string, Promise<AuthTokenSet>>();

/**
 * Refreshes the oAuth2 tokens of the given account and updates the `accounts` store (the storage follows).
 *
 * - **One refresh at a time for an account**: the callers that arrive while it runs wait for it and share its result. Without that,
 *   requests that find an expired token together would each refresh with the same refresh token, which the platform only accepts once.
 * - It uses the **most recent tokens** of the account (the ones of the store) and not the ones of the object given, which may have
 *   been refreshed by someone else since: the refresh token of the object would not be valid anymore. The object given is only
 *   used for an account that is not in the store (yet).
 * - MUTATES THE ACCOUNT GIVEN AS PARAMETER WITH THE NEW TOKENS, so that requests being built with it use the new ones.
 */
export const refreshOAuth2Token = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  const id = account.user.id;
  let refresh = refreshing.get(id);
  if (!refresh) {
    const current = getAccountWithTokens(id) ?? account;
    refresh = refreshTokenForAccount(current)
      .then(tokens => {
        useAccountsStore.getState().refreshToken(id, tokens);
        return tokens;
      })
      .finally(() => refreshing.delete(id));
    refreshing.set(id, refresh);
  }
  account.tokens = await refresh;
};
