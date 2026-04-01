import { ModuleScreenProps } from '~/app/navigation/types';
import type {
  consumeAuthErrorAction,
  loginCredentialsActionAddFirstAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/actions';
import type { AuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation/types';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface AuthLoginCredentialsScreenStoreProps {
  error: AuthState['error'];
  lockLogin: boolean;
}

export interface AuthLoginCredentialsScreenDispatchProps {
  tryLoginAdd: (
    ...args: Parameters<typeof loginCredentialsActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof loginCredentialsActionAddFirstAccount>>;
  tryLoginReplace: (
    ...args: Parameters<typeof loginCredentialsActionReplaceAccount>
  ) => ReturnType<ReturnType<typeof loginCredentialsActionReplaceAccount>>;
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => ReturnType<ReturnType<typeof consumeAuthErrorAction>>;
}

export interface AuthLoginCredentialsScreenProps
  extends
    AuthLoginCredentialsScreenStoreProps,
    AuthLoginCredentialsScreenDispatchProps,
    ModuleScreenProps<'auth/login/credentials'> {
  forgotPasswordRoute: (login?: string) => StackNavigationAction;
  forgotIdRoute: StackNavigationAction;
}
