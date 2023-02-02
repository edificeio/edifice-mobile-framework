import { NavigationInjectedProps } from 'react-navigation';

export enum EmailState {
  PRISTINE = 'pristine',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
}

export interface UserEmailScreenEventProps {
  onLogout(): void;
}

export type UserEmailScreenProps = UserEmailScreenEventProps & NavigationInjectedProps;
