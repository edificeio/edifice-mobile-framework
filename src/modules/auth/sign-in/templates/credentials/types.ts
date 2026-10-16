import { Platform } from '~/framework/util/appConf';
import type { AuthActiveAccount, AuthCredentials, AuthSavedAccount } from '~/modules/auth/model';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface SignInCredentialsScreenTemplateProps {
  account?: AuthSavedAccount | AuthActiveAccount;
  loginUsed?: string;
  platform: Platform['name'];
  lockLogin?: boolean;
  handleSignIn: (credentials: AuthCredentials, screenKey: number, accountToReplaceId?: string) => Promise<void>;
}
