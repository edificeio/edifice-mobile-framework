import { AuthCredentials, AuthSavedAccount } from '~/framework/modules/auth/model';
import type { AuthState } from '~/framework/modules/auth/redux/types';
import type {
  consumeAuthErrorAction,
  loginCredentialsActionAddFirstAccount,
  loginCredentialsActionReplaceAccount,
} from '~/framework/modules/auth/thunks';
import { Platform } from '~/framework/util/appConf';

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

export interface SignInCredentialsScreenTemplateProps {
  account?: AuthSavedAccount;
  loginUsed?: string;
  platform: Platform['name'];
  lockLogin?: boolean;
  handleSignIn: (credentials: AuthCredentials, screenKey: number, accountToReplace?: string) => Promise<void>;
}
