import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { restoreAccountAction } from '~/framework/modules/auth/actions';
import { AuthMixedAccountMap } from '~/framework/modules/auth/model';
import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export enum LoginState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
}

export interface AuthAccountSelectionScreenNavParams {}

export interface AuthAccountSelectionScreenProps {
  accounts: AuthMixedAccountMap;
}

export interface AuthAccountSelectionScreenDispatchProps {
  tryRestore: (...args: Parameters<typeof restoreAccountAction>) => ReturnType<ReturnType<typeof restoreAccountAction>>;
}

export interface AuthAccountSelectionScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.accountSelection>,
    AuthAccountSelectionScreenProps,
    AuthAccountSelectionScreenDispatchProps {}
