import React from 'react';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { restoreAccount } from '~/modules/auth/flows';
import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';
import { getActiveAccount } from '~/modules/auth/store/accounts';
import AccountListSheetScreenTemplate, { accountListSheetOptions } from '~/modules/auth/templates/account-list-sheet';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/**
 * The connected user chooses another saved account to switch to, or removes one.
 * If the account can't be switched to (no valid tokens, or the switch failed), `restoreAccount` sends the user to the sign-in
 * screens (`load-account`) with a `restore` status.
 */
const AuthSwitchAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);

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

  return (
    <AccountListSheetScreenTemplate
      description={I18n.get('auth-accountlist-change-description')}
      onPress={onPress}
      title={I18n.get('auth-accountlist-change-title')}
      onDelete={trackingAccountEvents.deleteAccountFromSwitchAccount}
    />
  );
});
AuthSwitchAccountScreen.displayName = 'AuthSwitchAccountScreen';

export default defineModal({
  options: accountListSheetOptions,
  screen: AuthSwitchAccountScreen,
});
