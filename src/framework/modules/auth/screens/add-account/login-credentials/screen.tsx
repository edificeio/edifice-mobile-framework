import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import LoginCredentialsScreen from '~/framework/modules/auth/templates/login-credentials';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { AuthLoginCredentialsScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginCredentials>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-login-title'),
    titleTestID: 'login-title',
    backButtonTestID: 'login-back',
  }),
});

export default function AuthLoginCredentialsScreen(props: AuthLoginCredentialsScreenPrivateProps) {
  return <LoginCredentialsScreen {...props} />;
}
