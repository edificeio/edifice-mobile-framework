import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoginRedirectScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import LoginRedirectPage from '~/framework/modules/auth/templates/login-redirect';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginRedirect>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-wayf-main-title'),
  }),
});

function AuthLoginRedirectScreen(props: AuthLoginRedirectScreenPrivateProps) {
  return <LoginRedirectPage {...props} />;
}

export default AuthLoginRedirectScreen;
