import { ThunkDispatch } from 'redux-thunk';

import { ModuleScreenProps } from '~/app/navigation/types';
import { AuthState } from '~/framework/modules/auth/redux/types';
import { loginFederationActionAddFirstAccount } from '~/framework/modules/auth/thunks';
import { StackNavigationAction } from '~/framework/navigation/types';

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
  auth: AuthState;
}

export interface IWayfScreenProps extends WAYFScreenDispatchProps, WAYFScreenStoreProps, ModuleScreenProps<'auth/wayf'> {
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
