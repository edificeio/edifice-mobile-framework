import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';

import { dispatchToLegacyStore } from './legacy-redux';
import { notifications } from '../service/notifications';
import { assertSession, useAccountsStore } from '../store/accounts';
import { useSignInStore } from '../store/sign-in';

/**
 * Disconnects the connected account and removes its tokens (the account stays among the saved ones).
 * @throws if there is no connected account.
 */
export const logout = async () => {
  const account = assertSession();
  await notifications.disableForAccount(account);
  useAccountsStore.getState().logout();
  useSignInStore.getState().reset();
  dispatchToLegacyStore(createEndSessionAction()); // flush sessionReducers of not yet migrated modules
};
