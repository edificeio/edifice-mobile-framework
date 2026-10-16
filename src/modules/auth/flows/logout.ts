import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';

import { dispatchToLegacyStore } from './legacy-redux';
import { notifications } from '../service/notifications';
import { assertConnectedAccount, useAccountsStore } from '../store/accounts';
import { useSignInStore } from '../store/sign-in';

/**
 * Disconnects the connected account and removes its tokens (the account stays among the saved ones).
 * Works at any stage: an account with a requirement can be logged out (its session never started, so it has no notifications).
 * @throws if there is no connected account.
 */
export const logout = async () => {
  const account = assertConnectedAccount();
  if (account.requirement === undefined) await notifications.disableForAccount(account);
  useAccountsStore.getState().logout();
  useSignInStore.getState().reset();
  dispatchToLegacyStore(createEndSessionAction()); // flush sessionReducers of not yet migrated modules
};
