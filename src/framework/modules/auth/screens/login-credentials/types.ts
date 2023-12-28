import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ILoginResult, consumeAuthError, loginAction } from '~/framework/modules/auth/actions';
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
}

export interface LoginCredentialsScreenStoreProps {
  auth: IAuthState;
}

export interface LoginCredentialsScreenDispatchProps {
  tryLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthError>) => void;
}

export type LoginCredentialsScreenPrivateProps = LoginCredentialsScreenProps &
  LoginCredentialsScreenStoreProps &
  LoginCredentialsScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginCredentials>;
