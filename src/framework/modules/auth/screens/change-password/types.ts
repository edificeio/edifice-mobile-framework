import { NavigationAction } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IChangePasswordModel, changePasswordAction, manualLogoutAction } from '~/framework/modules/auth/actions';
import type {
  AuthCredentials,
  AuthLoggedAccount,
  AuthUsernameCredential,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
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
}

export interface ChangePasswordScreenStoreProps {
  session?: AuthLoggedAccount;
  platform?: Platform;
  context?: PlatformAuthContext;
}

export interface ChangePasswordScreenDispatchProps {
  tryLogout: (...args: Parameters<typeof manualLogoutAction>) => ReturnType<ReturnType<typeof manualLogoutAction>>;
  trySubmit: (...args: Parameters<typeof changePasswordAction>) => ReturnType<ReturnType<typeof changePasswordAction>>;
}

export type ChangePasswordScreenPrivateProps = ChangePasswordScreenProps &
  ChangePasswordScreenStoreProps &
  ChangePasswordScreenDispatchProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.changePassword | typeof authRouteNames.changePasswordModal>;

export interface ChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}
