import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ILoginResult, loginAction, markLoginErrorTimestampAction } from '~/framework/modules/auth/actions';
import type { AuthErrorCode } from '~/framework/modules/auth/model';
import type { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import type { IAuthState } from '~/framework/modules/auth/reducer';
import type { Platform } from '~/framework/util/appConf';

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
