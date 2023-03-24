import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

import { IAuthContext, IAuthCredentials } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

export interface AuthChangeEmailScreenDispatchProps {
  onLogout(): void;
}

export interface AuthChangeEmailScreenNavParams {
  context: IAuthContext;
  credentials: IAuthCredentials;
  defaultEmail: string;
  modificationType: ModificationType;
  navBarTitle: string;
  platform: Platform;
}

export interface AuthChangeEmailScreenProps {}

export interface AuthChangeEmailScreenStoreProps {}

export interface AuthChangeEmailScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof AuthRouteNames.changeEmail>,
    AuthChangeEmailScreenProps,
    AuthChangeEmailScreenStoreProps,
    AuthChangeEmailScreenDispatchProps {}

export enum EmailState {
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  PRISTINE = 'pristine',
}
