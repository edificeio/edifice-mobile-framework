import { NavigationInjectedProps } from 'react-navigation';

import { IUpdatableProfileValues } from '~/user/actions/profile';

export enum EmailState {
  PRISTINE = 'pristine',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
}

export interface UserEmailScreenEventProps {
  onLogout(): void;
  onSaveNewEmail: (updatedProfileValues: IUpdatableProfileValues) => void;
}

export type UserEmailScreenProps = UserEmailScreenEventProps & NavigationInjectedProps;
