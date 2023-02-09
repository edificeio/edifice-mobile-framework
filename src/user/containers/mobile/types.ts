import type { NavigationInjectedProps } from 'react-navigation';

import type { IUpdatableProfileValues } from '~/user/actions/profile';

export enum MobileState {
  PRISTINE = 'pristine',
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  MOBILE_ALREADY_VERIFIED = 'mobileAlreadyVerified',
}

export interface UserMobileScreenEventProps {
  onLogout(): void;
  onSaveNewMobile(updatedProfileValues: IUpdatableProfileValues): void;
}

export type UserMobileScreenProps = UserMobileScreenEventProps & NavigationInjectedProps;
