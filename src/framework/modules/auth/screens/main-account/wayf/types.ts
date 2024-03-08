import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { WAYFScreenDispatchProps } from '~/framework/modules/auth/templates/wayf';

export interface AuthWayfScreenNavParams {
  platform: Platform;
}

export interface AuthWayfScreenProps {}

export interface AuthWayfScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.wayf>,
    AuthWayfScreenProps,
    WAYFScreenDispatchProps {}
