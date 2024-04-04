import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { LoginWayfScreenDispatchProps, LoginWayfScreenStoreProps } from '~/framework/modules/auth/templates/login-wayf';
import { Platform } from '~/framework/util/appConf';

export interface AuthLoginWayfScreenNavParams {
  platform: Platform;
  accountId?: string;
}

export interface AuthLoginWayfScreenProps {}

export interface AuthLoginWayfScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginWayf>,
    AuthLoginWayfScreenProps,
    LoginWayfScreenDispatchProps,
    LoginWayfScreenStoreProps {}
