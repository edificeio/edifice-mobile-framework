import type { Platform } from '~/framework/util/appConf';
import type { ForgotMode, ForgotResponse } from '~/modules/auth/model';

export type ForgotScreenStructure = {
  structureId: string;
  structureName: string;
};

export type ForgotScreenLoadingState = 'IDLE' | 'RUNNING' | 'DONE';

export interface SignInForgotScreenTemplateProps {
  platform: Platform['name'];
  mode: ForgotMode;
  login?: string;
  handleSubmit: (payload: { firstName: string; login: string; structureId: string }) => Promise<ForgotResponse>;
}
