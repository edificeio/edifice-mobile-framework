import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

import { restoreAction } from '../../../actions';
import { AuthMixedAccountMap } from '../../../model';

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
  tryRestore: (...args: Parameters<typeof restoreAction>) => ReturnType<ReturnType<typeof restoreAction>>;
}

export interface AuthAccountSelectionScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.accountSelection>,
    AuthAccountSelectionScreenProps,
    AuthAccountSelectionScreenDispatchProps {}
