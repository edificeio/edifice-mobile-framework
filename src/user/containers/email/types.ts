import { NavigationInjectedProps } from 'react-navigation';

export enum EmailState {
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  PRISTINE = 'pristine',
}

export interface UserEmailScreenEventProps {
  onLogout(): void;
}

export type UserEmailScreenProps = UserEmailScreenEventProps & NavigationInjectedProps;
