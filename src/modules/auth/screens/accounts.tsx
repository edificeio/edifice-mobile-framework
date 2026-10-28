import React from 'react';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import toast from '~/framework/components/toast';
import { useAuthFlows } from '~/modules/auth/flows';
import { AuthActiveAccount, AuthSavedAccount, getOrderedAccounts } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import AccountsScreenTemplate from '~/modules/auth/templates/accounts';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/**
 * The user chooses the account to sign in among the saved ones. A screen of the sign-in navigator that the sign-in does not know:
 * the container of the navigator adds it (see `AuthNavigationWrapper`).
 *
 * It is **not declared in the auth module** (`index.ts`) on purpose: it only works inside that independent navigator, which resets
 * itself from the sign-in status (e.g. to put the login screen on top after a failed restore). As a root screen, it would not follow.
 */
const AuthAccountsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const { removeAccount, restoreAccount } = useAuthFlows();
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
    [loading, restoreAccount],
  );

  const onDeleteAccount = React.useCallback(
    async (account: AuthSavedAccount | AuthActiveAccount) => {
      trackingAccountEvents.deleteAccountFromManageAccounts();
      await removeAccount(account);
      toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
    },
    [removeAccount],
  );

  // The navigator of the sign-in doesn't know this route: the action is forwarded to the parent navigation.
  const onAddAccount = React.useCallback(() => navigation.navigate('auth/$add-account'), [navigation]);

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
AuthAccountsScreen.displayName = 'AuthAccountsScreen';

export default defineScreen({ options: () => ({ title: I18n.get('auth-accountselection-title') }), screen: AuthAccountsScreen });
