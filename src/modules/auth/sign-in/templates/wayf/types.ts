import type { Platform } from '~/framework/util/appConf';
import type { Error } from '~/framework/util/error';
import type { AuthFederationCredentials } from '~/modules/auth/model';

import type { SignInNavigation } from '../../navigation';

export enum WAYFPageMode {
  EMPTY = 0,
  ERROR = 1,
  LOADING = 2,
  SELECT = 3,
  WEBVIEW = 4,
}

export interface SignInWayfScreenTemplateProps {
  accountId?: string;
  platform: Platform['name'];
  /** Current sign-in error of the store. */
  error?: Error.WithKey;
  consumeError: (errorKey: number) => void;
  navigation: SignInNavigation;
  /** Sign in with federation. Throws the error if it fails. */
  tryLogin: (credentials: AuthFederationCredentials, screenKey: number) => Promise<void>;
}

export interface SignInWayfScreenTemplateState {
  // User selection dropdown opened?
  dropdownOpened: boolean;
  // Current display mode: Error Message | Loading Indicator | User Selection | WebView
  mode: WAYFPageMode;
  // error key as it functions in `useErrorWithKey`
  errkey: number;
}
