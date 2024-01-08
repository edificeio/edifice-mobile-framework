import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { manualLogoutAction } from '~/framework/modules/auth/actions';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export enum ModificationType {
  EMAIL = 'email',
  MOBILE = 'mobile',
  PASSWORD = 'password',
}

export interface UserHomeScreenProps {}

export interface UserHomeScreenNavParams {}

export interface UserHomeScreenStoreProps {
  session?: AuthLoggedAccount;
}

export interface UserHomeScreenDispatchProps {
  handleLogout: (...args: Parameters<typeof manualLogoutAction>) => ReturnType<ReturnType<typeof manualLogoutAction>>;
}

export interface UserHomeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'home'>,
    UserHomeScreenProps,
    UserHomeScreenStoreProps,
    UserHomeScreenDispatchProps {}
