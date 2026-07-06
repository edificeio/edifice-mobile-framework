import * as React from 'react';

import { screenOptions } from '~/app/navigation/util';
import { getAddAccountRouteForLoginRedirection } from '~/framework/modules/auth/new-navigation';
import AuthPlatformsScreenTemplate from '~/framework/modules/auth/templates/platforms';

import type { AuthPlatformsAddAccountScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ headerShown: false }));

export default function AuthPlatformsAddAccountScreen(props: AuthPlatformsAddAccountScreenPrivateProps) {
  return <AuthPlatformsScreenTemplate {...props} getNextRoute={getAddAccountRouteForLoginRedirection} />;
}
