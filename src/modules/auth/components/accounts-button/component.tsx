import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { userCanAddAccount } from '~/modules/auth/model/business';
import { useAccountsStore, useSession } from '~/modules/auth/store/accounts';
import { trackingAccountEvents } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

import { LargeButton } from './large-button';

export interface AccountsButtonProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * The button to act on the accounts of the connected user:
 * - with a single account that can add another one: "add an account", which opens the add-account modal;
 * - with several accounts: "change account", which opens the modal that lists them.
 * Nothing is shown otherwise (a single account that can't add another one).
 */
export const AccountsButton = ({ style }: AccountsButtonProps) => {
  const navigation = useNavigation();
  const session = useSession();
  const accountsCount = useAccountsStore(s => Object.keys(s.accounts).length);
  const canAddAccount = userCanAddAccount(session);

  const addAccount = React.useCallback(() => navigation.navigate('auth/add-account'), [navigation]);
  const switchAccount = React.useCallback(() => {
    trackingAccountEvents.switchAccountPressButton();
    navigation.navigate('auth/switch-account');
  }, [navigation]);

  if (canAddAccount && accountsCount === 1) {
    return (
      <LargeButton
        action={addAccount}
        icon="ui-plus"
        style={style}
        testID="account-add-account"
        text={I18n.get('auth-accountbutton-add')}
      />
    );
  }
  if (accountsCount > 1) {
    return <LargeButton action={switchAccount} icon="ui-refresh" style={style} text={I18n.get('auth-accountbutton-change')} />;
  }
  return null;
};
