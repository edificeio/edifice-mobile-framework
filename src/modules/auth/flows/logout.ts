import { useSignInStore } from '~/modules/auth/sign-in/store';
import { assertActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';

import type { EndSession } from './end-session';

/**
 * Gives `logout`: disconnects the connected account and removes its tokens (the account stays among the saved ones).
 * Its session, if any, ends first (modules release it: the account still has its tokens then).
 * Works at any stage: an account with a requirement can be logged out (its session never started).
 * @throws if there is no connected account.
 */
export const createLogout = (endSession: EndSession) => async () => {
  const account = assertActiveAccount();
  endSession(account);
  useAccountsStore.getState().logout();
  useSignInStore.getState().reset();
};

export type LogoutFlow = ReturnType<typeof createLogout>;
