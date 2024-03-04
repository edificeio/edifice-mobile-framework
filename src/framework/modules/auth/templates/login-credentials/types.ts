import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { consumeAuthErrorAction, loginCredentialsActionMainAccount } from '~/framework/modules/auth/actions';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import type { IAuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation/types';
import type { Platform } from '~/framework/util/appConf';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface LoginCredentialsScreenProps {
  forgotPasswordRoute: StackNavigationAction;
  forgotIdRoute: StackNavigationAction;
}

export interface LoginCredentialsScreenNavParams {
  platform: Platform;
  // login?: string;
  accountId?: string;
}

export interface LoginCredentialsScreenStoreProps {
  // auth: IAuthState;
  error: IAuthState['error'];
}

export interface LoginCredentialsScreenDispatchProps {
  tryLogin: (
    ...args: Parameters<typeof loginCredentialsActionMainAccount>
  ) => ReturnType<ReturnType<typeof loginCredentialsActionMainAccount>>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => ReturnType<ReturnType<typeof consumeAuthErrorAction>>;
}

export type LoginCredentialsScreenPrivateProps = LoginCredentialsScreenProps &
  LoginCredentialsScreenStoreProps &
  LoginCredentialsScreenDispatchProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginCredentials>;
