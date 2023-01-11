import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Platform } from '~/framework/util/appConf';
import type { IChangePasswordModel } from '~/user/actions/changePassword';

import { ILoginResult, loginAction, logoutAction } from '../../actions';
import type { IAuthContext, IAuthCredentials, IChangePasswordPayload, ISession } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

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
