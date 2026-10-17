import React from 'react';
import { StyleSheet, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineModal } from '~/app/navigation-new';
import { UI_SIZES } from '~/framework/components/constants';
import toast from '~/framework/components/toast';
import { AccountList } from '~/modules/auth/components/account-list';
import { removeAccount, restoreAccount } from '~/modules/auth/flows';
import { type AuthActiveAccount, type AuthSavedAccount, getOrderedAccounts } from '~/modules/auth/model';
import { getActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/**
 * The connected user chooses another saved account to switch to, or removes one.
 * If the account can't be switched to (no valid tokens, or the switch failed), `restoreAccount` sends the user to the sign-in
 * screens (`load-account`) with a `restore` status.
 */
const AuthSwitchAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const accounts = useAccountsStore(s => s.accounts);
  const data = React.useMemo(() => getOrderedAccounts(accounts), [accounts]);
  const [loading, setLoading] = React.useState(false);

  // With less than two accounts there is nothing to switch to.
  const noChoice = data.length < 2;
  React.useEffect(() => {
    if (noChoice && navigation.canGoBack()) navigation.goBack();
  }, [navigation, noChoice]);

  const onPress = React.useCallback(
    async (account: AuthSavedAccount | AuthActiveAccount) => {
      if (loading) return;
      if (getActiveAccount()?.user.id === account.user.id) {
        navigation.goBack();
        return;
      }
      setLoading(true);
      // When it is switched, the modal goes away with the end of the session of the previous account: the loading is not reset.
      if (!(await restoreAccount(account))) setLoading(false);
    },
    [loading, navigation],
  );

  const onDelete = React.useCallback(async (account: AuthSavedAccount | AuthActiveAccount) => {
    try {
      trackingAccountEvents.deleteAccountFromSwitchAccount();
      const wasActive = getActiveAccount()?.user.id === account.user.id;
      await removeAccount(account);
      if (!wasActive) toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, UI_SIZES.spacing.big) }]}>
      <AccountList
        accounts={data}
        description={I18n.get('auth-accountlist-change-description')}
        onDelete={onDelete}
        onPress={onPress}
        title={I18n.get('auth-accountlist-change-title')}
      />
    </View>
  );
});
AuthSwitchAccountScreen.displayName = 'AuthSwitchAccountScreen';

const styles = StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.big, paddingTop: UI_SIZES.spacing.big },
});

export default defineModal({
  options: { headerShown: false, presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true },
  screen: AuthSwitchAccountScreen,
});
