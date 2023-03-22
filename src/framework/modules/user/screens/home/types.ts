import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { logoutAction } from '~/framework/modules/auth/actions';
import { ISession } from '~/framework/modules/auth/model';

import type { UserNavigationParams } from '../../navigation';
import type { UserState } from '../../reducer';

export enum ModificationType {
  EMAIL = 'email',
  MOBILE = 'mobile',
  PASSWORD = 'password',
}

export interface UserHomeScreenProps {}

export interface UserHomeScreenNavParams {}

export interface UserHomeScreenStoreProps {
  session?: ISession;
}

export interface UserHomeScreenDispatchProps {
  handleLogout: (...args: Parameters<typeof logoutAction>) => ReturnType<ReturnType<typeof logoutAction>>;
}

export interface UserHomeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'home'>,
    UserHomeScreenProps,
    UserHomeScreenStoreProps,
    UserHomeScreenDispatchProps {}
