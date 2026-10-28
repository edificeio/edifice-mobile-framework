import React from 'react';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { useAuthFlows } from '~/modules/auth/flows';
import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';
import { getActiveAccount } from '~/modules/auth/store/accounts';
import AccountListSheetScreenTemplate, { accountListSheetOptions } from '~/modules/auth/templates/account-list-sheet';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

/** Resolves after the next frame: the screen has rendered what was asked before (the animation needs it to be played). */
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/**
 * The connected user chooses another saved account to switch to, or removes one.
 * If the account can't be switched to (no valid tokens, or the switch failed), `restoreAccount` sends the user to the sign-in
 * screens (`load-account`) with a `login` status.
 */
const AuthSwitchAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const { restoreAccount } = useAuthFlows();
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
      // When it can't be, the sheet stays during the attempt, then closes by itself before the session ends: the screens it was on
      // being replaced under a presented modal would not animate. The next frame lets the closing start before they are replaced.
      const restored = await restoreAccount(account, {
        beforeLeave: async () => {
          navigation.goBack();
          await nextFrame();
        },
      });
      if (!restored) setLoading(false);
    },
    [loading, navigation, restoreAccount],
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
