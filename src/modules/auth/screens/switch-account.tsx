import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

import { defineModal } from '~/app/navigation-new';
import { sheetSpacingStyles, useFormSheetStyleFix } from '~/app/navigation-new/layout';
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
    <View style={useFormSheetStyleFix()}>
      <AccountList
        ListComponent={FlatList}
        accounts={data}
        description={I18n.get('auth-accountlist-change-description')}
        onDelete={onDelete}
        onPress={onPress}
        title={I18n.get('auth-accountlist-change-title')}
        contentContainerStyle={sheetSpacingStyles.padding}
      />
    </View>
  );
});
AuthSwitchAccountScreen.displayName = 'AuthSwitchAccountScreen';

export default defineModal({
  options: () => ({
    headerShown: false,
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
  }),
  screen: AuthSwitchAccountScreen,
});
