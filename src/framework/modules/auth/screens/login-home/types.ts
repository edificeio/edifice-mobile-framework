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
  tryLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthError>) => void;
}

export type LoginHomeScreenPrivateProps = LoginHomeScreenProps &
  LoginHomeScreenStoreProps &
  LoginHomeScreenDispatchProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginHome>;
