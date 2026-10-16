import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import service from '~/modules/auth/service';
import { assertConnectedAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { dispatchToLegacyStore } from './legacy-redux';

/**
 * Disconnects the connected account and removes its tokens (the account stays among the saved ones).
 * Works at any stage: an account with a requirement can be logged out (its session never started, so it has no notifications).
 * @throws if there is no connected account.
 */
export const logout = async () => {
  const account = assertConnectedAccount();
  if (account.requirement === undefined) await service.notifications.disableForAccount(account);
  useAccountsStore.getState().logout();
  useSignInStore.getState().reset();
  dispatchToLegacyStore(createEndSessionAction()); // flush sessionReducers of not yet migrated modules
};
