import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { logoutAction } from '~/framework/modules/auth/actions';
import type { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthChangeEmailScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
}

export interface AuthChangeEmailScreenNavParams {
  defaultEmail?: string;
  modificationType?: ModificationType;
  navBarTitle?: string;
  platform: Platform;
}

export interface AuthChangeEmailScreenProps {}

export interface AuthChangeEmailScreenStoreProps {}

export interface AuthChangeEmailScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.changeEmail>,
    AuthChangeEmailScreenProps,
    AuthChangeEmailScreenStoreProps,
    AuthChangeEmailScreenDispatchProps {}

export enum EmailState {
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  PRISTINE = 'pristine',
}

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}
