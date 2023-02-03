import { NavigationInjectedProps } from 'react-navigation';

import { IUserSession } from '~/framework/util/session';
import { IUpdatableProfileValues } from '~/user/actions/profile';

export enum CodeState {
  PRISTINE = 'pristine',
  CODE_RESENT = 'codeResent',
  CODE_WRONG = 'codeWrong',
  CODE_EXPIRED = 'codeExpired',
  CODE_CORRECT = 'codeCorrect',
  CODE_STATE_UNKNOWN = 'codeStateUnknown',
}

export enum ResendResponse {
  SUCCESS = 'success',
  FAIL = 'fail',
}

export interface MFAScreenDataProps {
  session: IUserSession;
}

export interface MFAScreenEventProps {
  onLogin(credentials?: { username: string; password: string; rememberMe: boolean }): void;
  onUpdateProfile: (updatedProfileValues: IUpdatableProfileValues) => void;
}

export type MFAScreenProps = MFAScreenDataProps & MFAScreenEventProps & NavigationInjectedProps;
