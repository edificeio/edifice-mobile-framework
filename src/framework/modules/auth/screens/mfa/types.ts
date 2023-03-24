import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModificationType } from '~/framework/modules/user/screens/home/types';
import { Platform } from '~/framework/util/appConf';
import { IUpdatableProfileValues } from '~/user/actions/profile';

import { IAuthContext, IAuthCredentials, ISession } from '../../model';
import type { AuthRouteNames, IAuthNavigationParams } from '../../navigation';

export interface AuthMFAScreenDispatchProps {
  onLogin(credentials?: IAuthCredentials): void;
  onUpdateProfile: (updatedProfileValues: IUpdatableProfileValues) => void;
}

export interface AuthMFAScreenNavParams {
  context: IAuthContext;
  credentials: IAuthCredentials;
  email: string;
  isEmailMFA: boolean;
  isMobileMFA: boolean;
  mobile: string;
  modificationType: ModificationType;
  navBarTitle: string;
  platform: Platform;
}

export interface AuthMFAScreenProps {}

export interface AuthMFAScreenStoreProps {
  session: ISession | undefined;
}

export interface AuthMFAScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof AuthRouteNames.mfa>,
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

export enum ResendResponse {
  FAIL = 'fail',
  SUCCESS = 'success',
}
