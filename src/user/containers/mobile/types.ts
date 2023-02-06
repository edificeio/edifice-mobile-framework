import { NavigationInjectedProps } from 'react-navigation';

export enum MobileState {
  PRISTINE = 'pristine',
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  MOBILE_ALREADY_VERIFIED = 'mobileAlreadyVerified',
}

export interface UserMobileScreenEventProps {
  onLogout(): void;
}

export type UserMobileScreenProps = UserMobileScreenEventProps & NavigationInjectedProps;
