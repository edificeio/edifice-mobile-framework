import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ILoginResult, loginAction, refreshRequirementsAction } from '~/framework/modules/auth/actions';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { UpdatableProfileValues } from '~/framework/modules/user/actions';
import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthMFAScreenDispatchProps {
  tryLogin: (...args: Parameters<typeof loginAction>) => Promise<ILoginResult>;
  tryRefreshRequirements: (
    ...args: Parameters<typeof refreshRequirementsAction>
  ) => ReturnType<ReturnType<typeof refreshRequirementsAction>>;
  tryUpdateProfile: (updatedProfileValues: UpdatableProfileValues) => Promise<void>;
}

export interface AuthMFAScreenNavParams {
  email?: string;
  isEmailMFA?: boolean;
  isMobileMFA?: boolean;
  mfaRedirectionRoute?: string;
  mobile?: string;
  modificationType?: ModificationType;
  navBarTitle: string;
  platform: Platform;
  rememberMe?: boolean;
}

export interface AuthMFAScreenProps {}

export interface AuthMFAScreenStoreProps {
  session?: AuthLoggedAccount;
}

export interface AuthMFAScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.mfa | typeof authRouteNames.mfaModal>,
    AuthMFAScreenProps,
    AuthMFAScreenStoreProps,
    AuthMFAScreenDispatchProps {}

export enum CodeState {
  CODE_CORRECT = 'codeCorrect',
  CODE_EXPIRED = 'codeExpired',
  CODE_RESENT = 'codeResent',
  CODE_STATE_UNKNOWN = 'codeStateUnknown',
  CODE_WRONG = 'codeWrong',
  PRISTINE = 'pristine',
}

export interface PageTexts {
  feedback: string;
  message: string;
  messageSent: string;
  resendToast: string;
  title: string;
}

export enum ResendResponse {
  FAIL = 'fail',
  SUCCESS = 'success',
}
