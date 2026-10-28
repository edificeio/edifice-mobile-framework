import { Platform } from '~/framework/util/appConf';
import type { AuthCredentials } from '~/modules/auth/model';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface SignInCredentialsScreenTemplateProps {
  /** The account to sign in again, which the sign-in replaces. */
  accountId?: string;
  loginUsed?: string;
  platform: Platform['name'];
  lockLogin?: boolean;
  handleSignIn: (credentials: AuthCredentials, screenKey: number, accountToReplaceId?: string) => Promise<void>;
}
