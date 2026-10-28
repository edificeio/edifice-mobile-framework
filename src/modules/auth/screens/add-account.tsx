import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';
import type { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { defineModal } from '~/app/navigation-new';
import { modalCloseButtonOptions } from '~/app/navigation-new/options';
import { useAuthFlows } from '~/modules/auth/flows';
import { AuthNavigationWrapper } from '~/modules/auth/navigation/navigation-container';
import { getAddAccountNavigationState } from '~/modules/auth/navigation/sign-in-navigation-state';
import { useStableNavigationState } from '~/modules/auth/sign-in/navigation';
import { AddAccountAuthPlatformsScreen } from '~/modules/auth/sign-in/screens/platforms';
import { useSignInStore } from '~/modules/auth/sign-in/store';

/**
 * Add Account stack has special screen options for 'sign-in/platforms' screen.
 * This replace the normal `sign-in/platforms` that is by default in AuthNavigationWrapper.
 */
const screens = { 'sign-in/platforms': AddAccountAuthPlatformsScreen };

/** The first screen of the navigator has no back button, but must close the modal (the go back is forwarded to the modal). */
const screenOptions: NativeStackNavigatorProps['screenOptions'] = ({ navigation, route }) =>
  navigation.getState().routes[0]?.key === route.key ? modalCloseButtonOptions({ navigation }, { always: true }) : {};

const useAddAccountNavigationState = () => {
  const status = useSignInStore(s => s.status);
  const attempt = useSignInStore(s => s.attempt);
  return useStableNavigationState(getAddAccountNavigationState(status), attempt);
};

/**
 * Signing in from here adds the account to the saved ones, and makes it the connected one (the current one is put to sleep).
 * If the account is already saved, it is replaced by the new sign-in (the accounts are stored by id).
 * The modal has no header of its own: the sign-in screens show theirs.
 */
const AuthAddAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigationState = useAddAccountNavigationState();
  const { setActiveAccount } = useAuthFlows();
  return (
    <AuthNavigationWrapper
      navigationState={navigationState}
      onSignedIn={setActiveAccount}
      screenOptions={screenOptions}
      screens={screens}
    />
  );
});
AuthAddAccountScreen.displayName = 'AuthAddAccountScreen';
export default defineModal({
  // The sign-in navigator it hosts tracks it (see `AuthNavigationWrapper`)
  delegatesTelemetry: true,
  options: () => ({ headerShown: false }),
  screen: AuthAddAccountScreen,
});
