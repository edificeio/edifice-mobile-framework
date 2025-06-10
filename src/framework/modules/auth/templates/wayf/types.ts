import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { loginFederationActionAddFirstAccount } from '~/framework/modules/auth/actions';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { IAuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation';

export enum WAYFPageMode {
  EMPTY = 0,
  ERROR = 1,
  LOADING = 2,
  SELECT = 3,
  WEBVIEW = 4,
}

export interface WAYFScreenDispatchProps {
  tryLogin: (
    ...args: Parameters<typeof loginFederationActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof loginFederationActionAddFirstAccount>>;
}

export interface WAYFScreenStoreProps {
  auth: IAuthState;
}

export interface IWayfScreenProps
  extends WAYFScreenDispatchProps,
    WAYFScreenStoreProps,
    NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.wayf> {
  dispatch: ThunkDispatch<any, any, any>;
  loginCredentialsNavAction: StackNavigationAction;
}

export interface IWayfScreenState {
  // User selection dropdown opened?
  dropdownOpened: boolean;
  // Current display mode: Error Message | Loading Indicator | User Selection | WebView
  mode: WAYFPageMode;
  // error key as it functions in `useErrorWithKey`
  errkey: number;
}
