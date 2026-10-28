import React from 'react';
import { StyleSheet, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { PrimaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';
import { AccountsButton } from '~/modules/auth/components';
import { useAuthFlows } from '~/modules/auth/flows';
import { I18n } from '~/util/i18n';

const styles = StyleSheet.create({
  container: { padding: UI_SIZES.spacing.medium },
});

/**
 * Home of the user module.
 * ToDo: bring the content of the legacy user module (`framework/modules/user`) here, step by step. For now only the accounts button.
 */
const UserHomeScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { confirmLogout } = useAuthFlows();
  return (
    <View style={styles.container}>
      <AccountsButton testID="account-add-account" />
      <PrimaryButton testID="account-logout" text="Se déconnecter" onPress={confirmLogout} />
    </View>
  );
});
UserHomeScreen.displayName = 'UserHomeScreen';

export default defineScreen({
  options: () => ({ title: I18n.get('user-profile-myaccount') }),
  screen: UserHomeScreen,
});
