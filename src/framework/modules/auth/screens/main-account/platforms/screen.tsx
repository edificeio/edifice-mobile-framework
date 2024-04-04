import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { StatusBar } from '~/framework/components/status-bar';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getLoginNextScreenNavAction } from '~/framework/modules/auth/navigation/main-account/router';
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
  }),
});

export default function AuthPlatformsScreen(props: AuthPlatformsScreenPrivateProps) {
  return (
    <>
      <StatusBar type="light" />
      <AuthPlatformGridScreen {...props} getNextRoute={getLoginNextScreenNavAction} />
    </>
  );
}
