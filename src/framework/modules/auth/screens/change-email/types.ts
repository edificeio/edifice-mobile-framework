import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Platform } from '~/framework/util/appConf';

import { IAuthContext } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

export interface AuthChangeEmailScreenProps {}

export interface AuthChangeEmailScreenNavParams {
  platform: Platform;
  context: IAuthContext;
}

export interface AuthChangeEmailScreenStoreProps {}

export interface AuthChangeEmailScreenDispatchProps {}

export interface AuthChangeEmailScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changeEmail>,
    AuthChangeEmailScreenProps,
    AuthChangeEmailScreenStoreProps,
    AuthChangeEmailScreenDispatchProps {}
