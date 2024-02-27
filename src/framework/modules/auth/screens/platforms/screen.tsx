import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getLoginNextScreenNavAction } from '~/framework/modules/auth/navigation/router-main-account';
import AuthPlatformGridScreen from '~/framework/modules/auth/templates/platform-grid';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { AuthPlatformsScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.platforms>): NativeStackNavigationOptions => ({
  headerShown: false,
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-platforms-title'),
  }),
});

export default function AuthPlatformsScreen(props: AuthPlatformsScreenPrivateProps) {
  return <AuthPlatformGridScreen {...props} getNextRoute={getLoginNextScreenNavAction} />;
}
