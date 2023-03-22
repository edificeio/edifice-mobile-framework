import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Platform } from '~/framework/util/appConf';

import { IAuthContext } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

export interface AuthChangeMobileScreenProps {}

export interface AuthChangeMobileScreenNavParams {
  platform: Platform;
  context: IAuthContext;
}

export interface AuthChangeMobileScreenStoreProps {}

export interface AuthChangeMobileScreenDispatchProps {}

export interface AuthChangeMobileScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changeMobile>,
    AuthChangeMobileScreenProps,
    AuthChangeMobileScreenStoreProps,
    AuthChangeMobileScreenDispatchProps {}
