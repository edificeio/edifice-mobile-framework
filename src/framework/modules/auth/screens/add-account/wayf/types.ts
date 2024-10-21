import { Platform } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';

export interface AuthWayfAddAccountScreenNavParams {
  platform: Platform;
}

export interface AuthWayfAddAccountScreenProps {}

export interface AuthWayfAddAccountScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountWayf>,
    AuthWayfAddAccountScreenProps,
    WAYFScreenDispatchProps {}
