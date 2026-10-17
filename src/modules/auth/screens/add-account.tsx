import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';
import type { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { defineModal } from '~/app/navigation-new';
import { modalCloseButtonOptions } from '~/app/navigation-new/options';
import { setAccount } from '~/modules/auth/flows';
import { AuthNavigationWrapper } from '~/modules/auth/navigation/navigation-container';
import signInModule from '~/modules/auth/sign-in';
import { useAddAccountNavigationState } from '~/modules/auth/sign-in/navigation';
import { AddAccountAuthPlatformsScreen } from '~/modules/auth/sign-in/screens/platforms';

/**
 * Add Account stack has special screen options for 'sign-in/platforms' screen.
 */
const screens = { ...signInModule.screens, 'sign-in/platforms': AddAccountAuthPlatformsScreen };

/** The first screen of the navigator has no back button, but must close the modal (the go back is forwarded to the modal). */
const screenOptions: NativeStackNavigatorProps['screenOptions'] = ({ navigation, route }) =>
  navigation.getState().routes[0]?.key === route.key ? modalCloseButtonOptions({ navigation }, { always: true }) : {};

/**
 * Signing in from here adds the account to the saved ones, and makes it the connected one (the current one is put to sleep).
 * If the account is already saved, it is replaced by the new sign-in (the accounts are stored by id).
 * The modal has no header of its own: the sign-in screens show theirs.
 */
const AuthAddAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigationState = useAddAccountNavigationState();
  return (
    <AuthNavigationWrapper
      navigationState={navigationState}
      onSignedIn={setAccount}
      screenOptions={screenOptions}
      screens={screens}
    />
  );
});
AuthAddAccountScreen.displayName = 'AuthAddAccountScreen';
export default defineModal({
  options: () => ({ headerShown: false }),
  screen: AuthAddAccountScreen,
});
