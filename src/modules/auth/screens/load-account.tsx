import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';

import { AuthNavigationWrapper } from '../navigation/navigation-container';

const AuthLoadAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  // const signIn = useSignInStore(s => s.signIn);
  return <AuthNavigationWrapper />;
});
AuthLoadAccountScreen.displayName = 'AuthLoadAccountScreen';
export default defineScreen({
  options: { headerShown: false, title: 'Connexion' },
  screen: AuthLoadAccountScreen,
});
