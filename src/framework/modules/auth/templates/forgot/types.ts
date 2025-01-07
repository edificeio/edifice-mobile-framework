import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { forgotAction } from '~/framework/modules/auth/actions';
import { ForgotMode } from '~/framework/modules/auth/model';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { Platform } from '~/framework/util/appConf';

export interface ForgotScreenProps {}

type ForgotScreenStructure = {
  structureId: string;
  structureName: string;
};

export type IForgotScreenState = {
  dropdownOpened: boolean;
  editing: boolean;
  firstName?: string;
  forgotState: 'IDLE' | 'RUNNING' | 'DONE';
  login: string;
  result?: { ok: boolean; structures?: any[]; error?: string };
  structures: ForgotScreenStructure[];
  structureName?: string;
  structureId?: string;
};

export interface IForgotPageEventProps {
  trySubmit: (...args: Parameters<typeof forgotAction>) => ReturnType<ReturnType<typeof forgotAction>>;
}

export type ForgotScreenPrivateProps = ForgotScreenProps &
  IForgotPageEventProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.forgot | typeof authRouteNames.addAccountForgot>;

export interface ForgotScreenNavParams {
  platform: Platform;
  mode: ForgotMode;
  login?: string;
}
