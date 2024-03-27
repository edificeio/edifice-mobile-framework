import { NavigationAction } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  IChangePasswordModel,
  changePasswordActionAddFirstAccount,
  manualLogoutAction,
} from '~/framework/modules/auth/actions';
import type {
  AuthCredentials,
  AuthLoggedAccount,
  AuthUsernameCredential,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { IAuthState } from '~/framework/modules/auth/reducer';
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
  replaceAccountId?: keyof IAuthState['accounts'];
  replaceAccountTimestamp?: number;
}

export interface ChangePasswordScreenStoreProps {
  session?: AuthLoggedAccount;
  platform?: Platform;
  context?: PlatformAuthContext;
}

export interface ChangePasswordScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof manualLogoutAction>) => ReturnType<ReturnType<typeof manualLogoutAction>>;
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
