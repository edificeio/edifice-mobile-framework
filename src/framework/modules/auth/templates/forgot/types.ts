import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { forgotAction } from '~/framework/modules/auth/actions';
import { ForgotMode } from '~/framework/modules/auth/model';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

export interface ForgotScreenProps {}

export type IForgotScreenState = {
  login: string;
  firstName?: string;
  structureName?: string;
  showStructurePicker: boolean;
  editing: boolean;
  structures: any[];
  result?: { ok: boolean; structures?: any[]; error?: string };
  forgotState: 'IDLE' | 'RUNNING' | 'DONE';
};

export interface IForgotPageEventProps {
  trySubmit: (...args: Parameters<typeof forgotAction>) => ReturnType<ReturnType<typeof forgotAction>>;
}

export type ForgotScreenPrivateProps = ForgotScreenProps &
  IForgotPageEventProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.forgot>;

export interface ForgotScreenNavParams {
  platform: Platform;
  mode: ForgotMode;
  login?: string;
}
