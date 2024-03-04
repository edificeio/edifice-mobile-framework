import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  consumeAuthErrorAction,
  loginCredentialsActionAddFirstAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/actions';
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
  forgotPasswordRoute: (login?: string) => StackNavigationAction;
  forgotIdRoute: StackNavigationAction;
}

export interface LoginCredentialsScreenNavParams {
  platform: Platform;
  accountId?: string;
}

export interface LoginCredentialsScreenStoreProps {
  error: IAuthState['error'];
  lockLogin: boolean;
}

export interface LoginCredentialsScreenDispatchProps {
  tryLoginAdd: (
    ...args: Parameters<typeof loginCredentialsActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof loginCredentialsActionAddFirstAccount>>;
  tryLoginReplace: (
    ...args: Parameters<typeof loginCredentialsActionReplaceAccount>
  ) => ReturnType<ReturnType<typeof loginCredentialsActionReplaceAccount>>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => ReturnType<ReturnType<typeof consumeAuthErrorAction>>;
}

export type LoginCredentialsScreenPrivateProps = LoginCredentialsScreenProps &
  LoginCredentialsScreenStoreProps &
  LoginCredentialsScreenDispatchProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginCredentials>;
