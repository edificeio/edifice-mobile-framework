import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ILoginResult, loginAction, logoutAction } from '~/framework/modules/auth/actions';
import type { IAuthContext, IAuthCredentials, IChangePasswordPayload, ISession } from '~/framework/modules/auth/model';
import type { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import type { Platform } from '~/framework/util/appConf';
import type { IChangePasswordModel } from '~/user/actions/changePassword';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface ChangePasswordScreenProps {
  // No public props
}

export interface ChangePasswordScreenNavParams {
  platform: Platform;
  context: IAuthContext;
  credentials?: IAuthCredentials;
  rememberMe?: boolean;
  forceChange?: boolean;
}

export interface ChangePasswordScreenStoreProps {
  session?: ISession;
}

export interface ChangePasswordScreenDispatchProps {
  handleLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>;
  handleSubmit(platform: Platform, payload: IChangePasswordPayload, forceChange?: boolean): Promise<void>;
}

export type ChangePasswordScreenPrivateProps = ChangePasswordScreenProps &
  ChangePasswordScreenStoreProps &
  ChangePasswordScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.changePassword>;

export interface ChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}
