import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { consumeAuthErrorAction, loginCredentialsAction } from '~/framework/modules/auth/actions';
import type { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import type { IAuthState } from '~/framework/modules/auth/reducer';
import type { Platform } from '~/framework/util/appConf';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface LoginCredentialsScreenProps {
  // No public props
}

export interface LoginCredentialsScreenNavParams {
  platform: Platform;
  login?: string;
}

export interface LoginCredentialsScreenStoreProps {
  // auth: IAuthState;
  error: IAuthState['error'];
}

export interface LoginCredentialsScreenDispatchProps {
  tryLogin: (...args: Parameters<typeof loginCredentialsAction>) => ReturnType<ReturnType<typeof loginCredentialsAction>>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => ReturnType<ReturnType<typeof consumeAuthErrorAction>>;
}

export type LoginCredentialsScreenPrivateProps = LoginCredentialsScreenProps &
  LoginCredentialsScreenStoreProps &
  LoginCredentialsScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginCredentials>;
