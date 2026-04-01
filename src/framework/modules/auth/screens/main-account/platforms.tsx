import * as React from 'react';

import type { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { getNavActionForPlatformSelect } from '~/framework/modules/auth/new-navigation';
import AuthPlatformsScreenTemplate, { AuthPlatformsScreenProps } from '~/framework/modules/auth/templates/platforms';

export default function AuthPlatformsScreen(props: Omit<AuthPlatformsScreenProps, 'getNextRoute'>) {
  return <AuthPlatformsScreenTemplate {...props} getNextRoute={getNavActionForPlatformSelect} />;
}
AuthPlatformsScreen.options = {
  headerShown: false,
  statusBarStyle: 'dark',
} satisfies NativeStackNavigatorProps['screenOptions'];
