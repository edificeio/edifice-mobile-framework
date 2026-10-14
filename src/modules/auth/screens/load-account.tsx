import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';

import { setAccount } from '../flows';
import { AuthNavigationWrapper } from '../navigation/navigation-container';

const AuthLoadAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  // Signing in from here sets the account as the (first) connected one, replacing the saved account being signed in again if any.
  return <AuthNavigationWrapper onSignedIn={setAccount} />;
});
AuthLoadAccountScreen.displayName = 'AuthLoadAccountScreen';
export default defineScreen({
  options: { headerShown: false, title: 'Connexion' },
  screen: AuthLoadAccountScreen,
});
