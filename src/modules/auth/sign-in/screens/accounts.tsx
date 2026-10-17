import React from 'react';

import { CommonActions, StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import toast from '~/framework/components/toast';
import { removeAccount, restoreAccount } from '~/modules/auth/flows';
import { AuthActiveAccount, AuthSavedAccount, getOrderedAccounts } from '~/modules/auth/model';
import { useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import AccountsScreenTemplate from '~/modules/auth/sign-in/templates/accounts';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { trackingAccountEvents } from '~/modules/auth/tracking';
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
      setLoading(true);
      // If the account can't be signed in, the sign-in status makes the navigator put its login screen on top of this one
      // (with the error): nothing to navigate here. When it is signed in, the screen goes away: the loading is not reset.
      if (!(await restoreAccount(account))) setLoading(false);
    },
    [loading],
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
