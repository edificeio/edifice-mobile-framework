import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { logoutAction, removeAccountAction, switchAccountAction } from '~/framework/modules/auth/actions';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { AuthState } from '~/framework/modules/auth/redux/types';
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
  accounts: AuthState['accounts'];
}

export interface UserHomeScreenDispatchProps {
  handleLogout: (...args: Parameters<typeof logoutAction>) => ReturnType<ReturnType<typeof logoutAction>>;
  trySwitch: (...args: Parameters<typeof switchAccountAction>) => ReturnType<ReturnType<typeof switchAccountAction>>;
  tryRemoveAccount: (...args: Parameters<typeof removeAccountAction>) => ReturnType<ReturnType<typeof removeAccountAction>>;
}

export interface UserHomeScreenPrivateProps
  extends
    NativeStackScreenProps<UserNavigationParams, 'home'>,
    UserHomeScreenProps,
    UserHomeScreenStoreProps,
    UserHomeScreenDispatchProps {}
