import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Platform } from '~/framework/util/appConf';

import type { ILoginResult, loginAction, markLoginErrorTimestampAction } from '../../actions';
import type { AuthErrorCode } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';
import type { IAuthState } from '../../reducer';

export interface LoginHomeScreenProps {
  // No public props
}

export interface LoginHomeScreenNavParams {
  platform: Platform;
}

export interface LoginHomeScreenStoreProps {
  auth: IAuthState;
}

export interface LoginHomeScreenDispatchProps {
  handleLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleConsumeError: (...args: Parameters<typeof markLoginErrorTimestampAction>) => Promise<void>;
}

export type LoginHomeScreenPrivateProps = LoginHomeScreenProps &
  LoginHomeScreenStoreProps &
  LoginHomeScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.loginHome>;

export interface LoginHomeScreenState {
  login: string;
  password: string;
  typing: boolean;
  rememberMe: boolean;
  loginState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: AuthErrorCode;
  errorTimestamp?: number; // Last known error timestamp. Used to display error only for the last login attempt.
}
