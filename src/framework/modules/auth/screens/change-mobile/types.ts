import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { manualLogoutAction } from '~/framework/modules/auth/actions';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

import { UpdatableUserInfo } from '../../model';

export interface AuthChangeMobileScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof manualLogoutAction>) => Promise<void>;
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
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.changeMobile>,
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
