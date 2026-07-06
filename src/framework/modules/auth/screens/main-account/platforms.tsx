import * as React from 'react';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getRouteForPlatformSelect } from '~/framework/modules/auth/new-navigation';
import AuthPlatformsScreenTemplate, { AuthPlatformsScreenProps } from '~/framework/modules/auth/templates/platforms';

export default function AuthPlatformsScreen(props: Omit<AuthPlatformsScreenProps, 'getNextRoute'>) {
  return <AuthPlatformsScreenTemplate {...props} getNextRoute={getRouteForPlatformSelect} />;
}
AuthPlatformsScreen.options = screenOptions(() => ({
  headerShown: false,
  statusBarStyle: 'dark',
  title: I18n.get('auth-platformselect-welcome'),
}));
