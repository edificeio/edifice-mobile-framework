import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UpdatableUserInfo } from '~/framework/modules/auth/model';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import type { logoutAction } from '~/framework/modules/auth/thunks';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthChangeMobileScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  trySaveNewMobile(updatedProfileValues: Partial<UpdatableUserInfo>): Promise<void>;
}

export interface AuthChangeMobileScreenNavParams {
  defaultMobile?: string;
  modificationType?: ModificationType;
  navBarTitle?: string;
  platform: Platform;
  // rememberMe?: boolean;
}

export interface AuthChangeMobileScreenProps {}

export interface AuthChangeMobileScreenStoreProps {}

export interface AuthChangeMobileScreenPrivateProps
  extends
    NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.changeMobile>,
    AuthChangeMobileScreenProps,
    AuthChangeMobileScreenStoreProps,
    AuthChangeMobileScreenDispatchProps {}

export enum MobileState {
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  PRISTINE = 'pristine',
  STALE = 'stale',
}

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}
