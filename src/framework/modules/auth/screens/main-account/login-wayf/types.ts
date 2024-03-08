import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { LoginWayfScreenDispatchProps, LoginWayfScreenStoreProps } from '~/framework/modules/auth/templates/login-wayf';

export interface AuthLoginWayfScreenNavParams {
  platform: Platform;
}

export interface AuthLoginWayfScreenProps {}

export interface AuthLoginWayfScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginWayf>,
    AuthLoginWayfScreenProps,
    LoginWayfScreenDispatchProps,
    LoginWayfScreenStoreProps {}
