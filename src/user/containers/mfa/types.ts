import { NavigationInjectedProps } from 'react-navigation';

import { IUserSession } from '~/framework/util/session';
import { IUpdatableProfileValues } from '~/user/actions/profile';

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

export interface MFAScreenDataProps {
  session: IUserSession;
}

export interface MFAScreenEventProps {
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
  onUpdateProfile: (updatedProfileValues: IUpdatableProfileValues) => void;
}

export type MFAScreenProps = MFAScreenDataProps & MFAScreenEventProps & NavigationInjectedProps;
