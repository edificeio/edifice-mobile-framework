import { ModuleScreenProps } from '~/app/navigation/types';
import { ForgotMode } from '~/framework/modules/auth/model';
import { forgotAction } from '~/framework/modules/auth/thunks';
import { Platform } from '~/framework/util/appConf';

export interface ForgotScreenProps {}

export type ForgotScreenStructure = {
  structureId: string;
  structureName: string;
};

export type ForgotScreenLoadingState = 'IDLE' | 'RUNNING' | 'DONE';

export interface ForgotScreenEventProps {
  trySubmit: (...args: Parameters<typeof forgotAction>) => ReturnType<ReturnType<typeof forgotAction>>;
}

export type ForgotScreenPrivateProps = ForgotScreenProps & ForgotScreenEventProps & ModuleScreenProps<'auth/forgot'>;

export interface ForgotScreenNavParams {
  platform: Platform;
  mode: ForgotMode;
  login?: string;
}
