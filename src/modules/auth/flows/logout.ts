import { Alert } from 'react-native';

import { useSignInStore } from '~/modules/auth/sign-in/store';
import { assertActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

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

/**
 * Gives `confirmLogout`: asks the user to confirm, then does `logout`. Nothing happens if the user cancels.
 * It doesn't wait for the answer: it returns as soon as the question is shown.
 */
export const createConfirmLogout = (logout: LogoutFlow) => () => {
  Alert.alert('', I18n.get('auth-disconnect-confirm'), [
    { style: 'default', text: I18n.get('common-cancel') },
    { onPress: logout, style: 'destructive', text: I18n.get('user-page-disconnect') },
  ]);
};
