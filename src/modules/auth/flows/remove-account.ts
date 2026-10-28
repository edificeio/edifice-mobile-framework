import { Alert } from 'react-native';

import type { SessionLifecycle } from '~/modules/auth/lifecycle';
import { accountIsLoggable, type AuthActiveAccount, type AuthSavedAccount } from '~/modules/auth/model';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { getActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

import type { LogoutFlow } from './logout';

/**
 * Gives `removeAccount`: removes the account from the saved ones (and its preferences from the storage). Logs it out first if it is
 * the connected one.
 */
export const createRemoveAccount =
  (lifecycle: SessionLifecycle, logout: LogoutFlow) => async (account: AuthActiveAccount | AuthSavedAccount) => {
    if (getActiveAccount()?.user.id === account.user.id) await logout();
    // Its tokens are about to go: the last chance for the modules to undo what it left
    else if (accountIsLoggable(account)) lifecycle.release(account);
    useAccountsStore.getState().removeAccount(account.user.id);
    // Whatever situation the sign-in was in, the user now must choose again among the accounts left.
    useSignInStore.getState().reset();
  };

export type RemoveAccountFlow = ReturnType<typeof createRemoveAccount>;

export interface ConfirmRemoveAccountOptions {
  /** Called once the user confirmed, before the account is removed. */
  beforeRemove?: () => void | Promise<void>;
}

/**
 * Gives `confirmRemoveAccount`: asks the user to confirm, then does `removeAccount`.
 * @returns whether the account was removed: false if the user cancelled (or dismissed the question). If `beforeRemove` or the removal
 * fails, the error is thrown.
 */
export const createConfirmRemoveAccount =
  (removeAccount: RemoveAccountFlow) =>
  (account: AuthActiveAccount | AuthSavedAccount, { beforeRemove }: ConfirmRemoveAccountOptions = {}) =>
    new Promise<boolean>((resolve, reject) => {
      Alert.alert(
        I18n.get('accountlistitem-removealert-title'),
        I18n.get('accountlistitem-removealert-description'),
        [
          {
            onPress: () => {
              Promise.resolve(beforeRemove?.())
                .then(() => removeAccount(account))
                .then(() => resolve(true), reject);
            },
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
          { onPress: () => resolve(false), text: I18n.get('common-cancel') },
        ],
        // The question can be dismissed without any button (Android: outside, back)
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
