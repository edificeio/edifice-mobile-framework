import * as React from 'react';

import { screenOptions } from '~/app/navigation/util';
import AuthPlatformsScreenTemplate from '~/framework/modules/auth/templates/platforms';

import type { AuthPlatformsAddAccountScreenPrivateProps } from './types';
import { getAddAccountRouteForLoginRedirection } from '../../../new-navigation';

export const computeNavBar = screenOptions(() => ({ headerShown: false }));

export default function AuthPlatformsAddAccountScreen(props: AuthPlatformsAddAccountScreenPrivateProps) {
  return <AuthPlatformsScreenTemplate {...props} getNextRoute={getAddAccountRouteForLoginRedirection} />;
}
