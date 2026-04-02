import * as React from 'react';

import { screenOptions } from '~/app/navigation/util';
import { getNavActionForPlatformSelect } from '~/framework/modules/auth/new-navigation';
import AuthPlatformsScreenTemplate, { AuthPlatformsScreenProps } from '~/framework/modules/auth/templates/platforms';

export default function AuthPlatformsScreen(props: Omit<AuthPlatformsScreenProps, 'getNextRoute'>) {
  return <AuthPlatformsScreenTemplate {...props} getNextRoute={getNavActionForPlatformSelect} />;
}
AuthPlatformsScreen.options = screenOptions(() => ({
  headerShown: false,
  statusBarStyle: 'dark',
}));
