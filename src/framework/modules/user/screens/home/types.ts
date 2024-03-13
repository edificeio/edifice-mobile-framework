import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { manualLogoutAction, switchAccountAction } from '~/framework/modules/auth/actions';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IAuthState } from '~/framework/modules/auth/reducer';
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
  accounts: IAuthState['accounts'];
}

export interface UserHomeScreenDispatchProps {
  handleLogout: (...args: Parameters<typeof manualLogoutAction>) => ReturnType<ReturnType<typeof manualLogoutAction>>;
  trySwitch: (...args: Parameters<typeof switchAccountAction>) => ReturnType<ReturnType<typeof switchAccountAction>>;
}

export interface UserHomeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'home'>,
    UserHomeScreenProps,
    UserHomeScreenStoreProps,
    UserHomeScreenDispatchProps {}
