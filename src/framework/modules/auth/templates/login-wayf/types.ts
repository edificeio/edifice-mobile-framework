import { ModuleScreenProps } from '~/app/navigation/types';
import { consumeAuthErrorAction } from '~/framework/modules/auth/actions';
import { AuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation/types';

export interface AuthLoginWayfScreenStoreProps {
  auth: AuthState;
  error: AuthState['error'];
}

export interface AuthLoginWayfScreenDispatchProps {
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => void;
}
export interface AuthLoginWayfScreenProps
  extends ModuleScreenProps<'auth/login/wayf'>, AuthLoginWayfScreenStoreProps, AuthLoginWayfScreenDispatchProps {
  wayfRoute: StackNavigationAction;
}

export interface LoginWayfScreenState {
  errkey: number;
}
