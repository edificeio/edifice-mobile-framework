import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthPlatformsAddAccountScreenPrivateProps } from './types';

import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getAddAccountLoginNextScreenNavAction } from '~/framework/modules/auth/navigation/add-account/router';
import AuthPlatformGridScreen from '~/framework/modules/auth/templates/platform-grid';
import { navBarOptions } from '~/framework/navigation/navBar';

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

export default function AuthPlatformsAddAccountScreen(props: AuthPlatformsAddAccountScreenPrivateProps) {
  return <AuthPlatformGridScreen {...props} getNextRoute={getAddAccountLoginNextScreenNavAction} />;
}
