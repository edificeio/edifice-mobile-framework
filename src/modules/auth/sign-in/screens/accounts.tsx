import React from 'react';

import { CommonActions, StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import toast from '~/framework/components/toast';
import { removeAccount, restoreAccount } from '~/modules/auth/flows';
import { withTracking } from '~/modules/auth/flows/track';
import {
  accountIsLoggable,
  AuthActiveAccount,
  AuthSavedAccount,
  AuthSavedLoggedInAccount,
  AuthSavedLoggedInAccountWithCredentials,
  getOrderedAccounts,
} from '~/modules/auth/model';
import { getRouteForAccountLoad, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import AccountsScreenTemplate from '~/modules/auth/sign-in/templates/accounts';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import track, { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/**
 * The user chooses the account to sign in among the saved ones.
 */
const SignInAccountsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useSignInNavigation();
  const accounts = useAccountsStore(s => s.accounts);
  const orderedAccounts = React.useMemo(() => getOrderedAccounts(accounts), [accounts]);
  const [loading, setLoading] = React.useState(false);

  const onSelectAccount = React.useCallback(
    async (account: AuthSavedAccount | AuthActiveAccount) => {
      if (loading) return;
      if (accountIsLoggable(account)) {
        try {
          setLoading(true);
          await withTracking(track.loginRestore, () => restoreAccount(account as AuthSavedLoggedInAccount | AuthActiveAccount));
          // Not reset: the screen goes away once the account is signed in.
        } catch (e) {
          setLoading(false);
          console.error(e);
          // On failure, `restoreAccount` sets the sign-in status & error, so the navigator puts the login screen of the account
          // on top of this screen by itself (the error is displayed there). Navigating manually would duplicate it.
        }
      } else {
        const route = getRouteForAccountLoad({
          id: account.user.id,
          login: (account.user as Partial<AuthSavedLoggedInAccountWithCredentials['user']>).loginUsed,
          platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
        });
        if (!route) {
          console.warn('AccountSelectionScreen: Missing platform for this account');
          toast.showError(I18n.get('auth-account-select-error'));
          return;
        }
        navigation.navigate(route);
      }
    },
    [loading, navigation],
  );

  const onDeleteAccount = React.useCallback(async (account: AuthSavedAccount | AuthActiveAccount) => {
    trackingAccountEvents.deleteAccountFromManageAccounts();
    await removeAccount(account);
    toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
  }, []);

  // The sign-in navigator doesn't know this route: the action is forwarded to the parent navigation.
  const onAddAccount = React.useCallback(
    () => navigation.dispatch(CommonActions.navigate({ name: 'auth/add-account' })),
    [navigation],
  );

  return (
    <AccountsScreenTemplate
      accounts={orderedAccounts}
      loading={loading}
      // Only one account: the user may add another one (more is not allowed).
      onAddAccount={orderedAccounts.length === 1 ? onAddAccount : undefined}
      onDeleteAccount={onDeleteAccount}
      onOpenManageAccounts={trackingAccountEvents.manageAccountsPressButton}
      onSelectAccount={onSelectAccount}
    />
  );
});
SignInAccountsScreen.displayName = 'SignInAccountsScreen';

export default defineScreen({ options: { title: I18n.get('auth-accountselection-title') }, screen: SignInAccountsScreen });
