import { NavigationAction } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  AuthActiveAccount,
  AuthCredentials,
  AuthUsernameCredential,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { AuthState } from '~/framework/modules/auth/redux/types';
import type { changePasswordActionAddFirstAccount, IChangePasswordModel, logoutAction } from '~/framework/modules/auth/thunks';
import type { Platform } from '~/framework/util/appConf';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface ChangePasswordScreenProps {
  // No public props
}

export interface ChangePasswordScreenNavParams {
  forceChange?: boolean;
  navCallback?: NavigationAction;
  useResetCode?: boolean;
  platform?: Platform;
  credentials?: AuthCredentials | AuthUsernameCredential;
  replaceAccountId?: keyof AuthState['accounts'];
  replaceAccountTimestamp?: number;
}

export interface ChangePasswordScreenStoreProps {
  session?: AuthActiveAccount;
  platform?: Platform;
  context?: PlatformAuthContext;
}

export interface ChangePasswordScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof logoutAction>) => ReturnType<ReturnType<typeof logoutAction>>;
  trySubmit: (
    ...args: Parameters<typeof changePasswordActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof changePasswordActionAddFirstAccount>>;
}

export type ChangePasswordScreenPrivateProps = ChangePasswordScreenProps &
  ChangePasswordScreenStoreProps &
  ChangePasswordScreenDispatchProps &
  NativeStackScreenProps<
    AuthNavigationParams,
    | typeof authRouteNames.changePassword
    | typeof authRouteNames.changePasswordModal
    | typeof authRouteNames.addAccountChangePassword
  >;

export interface ChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}
