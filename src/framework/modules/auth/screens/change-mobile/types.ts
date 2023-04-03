import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UpdatableProfileValues } from '~/framework/modules/user/actions';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

import { logoutAction } from '../../actions';
import { IAuthContext, IAuthCredentials } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

export interface AuthChangeMobileScreenDispatchProps {
  onLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  onSaveNewMobile(updatedProfileValues: UpdatableProfileValues): void;
}

export interface AuthChangeMobileScreenNavParams {
  context: IAuthContext;
  credentials: IAuthCredentials;
  defaultMobile: string;
  modificationType: ModificationType;
  navBarTitle: string;
  platform: Platform;
}

export interface AuthChangeMobileScreenProps {}

export interface AuthChangeMobileScreenStoreProps {}

export interface AuthChangeMobileScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof AuthRouteNames.changeMobile>,
    AuthChangeMobileScreenProps,
    AuthChangeMobileScreenStoreProps,
    AuthChangeMobileScreenDispatchProps {}

export enum MobileState {
  MOBILE_ALREADY_VERIFIED = 'mobileAlreadyVerified',
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  PRISTINE = 'pristine',
}
