import type { NavigationInjectedProps } from 'react-navigation';

import type { IUpdatableProfileValues } from '~/user/actions/profile';

export enum MobileState {
  MOBILE_ALREADY_VERIFIED = 'mobileAlreadyVerified',
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  PRISTINE = 'pristine',
}

export interface UserMobileScreenEventProps {
  onLogout(): void;
  onSaveNewMobile(updatedProfileValues: IUpdatableProfileValues): void;
}

export type UserMobileScreenProps = UserMobileScreenEventProps & NavigationInjectedProps;
