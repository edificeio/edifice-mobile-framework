import { NavigationAction } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ILoginResult, changePasswordAction, loginAction, logoutAction } from '~/framework/modules/auth/actions';
import type { IAuthContext, IAuthCredentials, IAuthUsernameCredential, ISession } from '~/framework/modules/auth/model';
import type { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import type { IChangePasswordModel } from '~/framework/modules/user/actions';
import type { Platform } from '~/framework/util/appConf';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface ChangePasswordScreenProps {
  // No public props
}

export interface ChangePasswordScreenNavParams {
  platform: Platform;
  context: IAuthContext;
  credentials: IAuthCredentials | IAuthUsernameCredential;
  rememberMe?: boolean;
  forceChange?: boolean;
  navCallback?: NavigationAction;
}

export interface ChangePasswordScreenStoreProps {
  session?: ISession;
}

export interface ChangePasswordScreenDispatchProps {
  tryLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  tryLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  trySubmit: (...args: Parameters<typeof changePasswordAction>) => Promise<ILoginResult>;
}

export type ChangePasswordScreenPrivateProps = ChangePasswordScreenProps &
  ChangePasswordScreenStoreProps &
  ChangePasswordScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.changePassword | typeof authRouteNames.changePasswordModal>;

export interface ChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
  oldPassword: string;
  newPassword: string;
  confirm: string;
}
