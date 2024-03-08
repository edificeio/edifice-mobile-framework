import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { consumeAuthErrorAction } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { IAuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation/types';

export interface LoginWayfScreenStoreProps {
  auth: IAuthState;
  error: IAuthState['error'];
}

export interface LoginWayfScreenProps {
  wayfRoute: StackNavigationAction;
}
export interface LoginWayfScreenDispatchProps {
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => void;
}
export interface LoginWayfScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.loginWayf>,
    LoginWayfScreenProps,
    LoginWayfScreenStoreProps,
    LoginWayfScreenDispatchProps {}

export interface LoginWayfScreenState {
  errkey: number;
}
