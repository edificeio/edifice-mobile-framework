import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { LoginWayfScreenDispatchProps, LoginWayfScreenStoreProps } from '~/framework/modules/auth/templates/login-wayf';

export interface AuthLoginWayfAddAccountScreenProps {}

export interface AuthLoginWayfAddAccountScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountLoginWayf>,
    AuthLoginWayfAddAccountScreenProps,
    LoginWayfScreenDispatchProps,
    LoginWayfScreenStoreProps {}
