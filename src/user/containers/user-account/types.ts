import { ImageURISource } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import { IUserSession } from '~/framework/util/session';
import { IUserInfoState } from '~/user/state/info';

export enum ModificationType {
  EMAIL = 'email',
  MOBILE = 'mobile',
  PASSWORD = 'password',
}

export interface UserAccountScreenState {
  avatarPhoto?: '' | ImageURISource;
  loadingMFARequirementForEmail: boolean;
  loadingMFARequirementForMobile: boolean;
  loadingMFARequirementForPassword: boolean;
  showVersionType: boolean;
  updatingAvatar: boolean;
  versionOverride: string;
  versionType: string;
}

export interface UserAccountScreenDataProps {
  navigation: any;
  session: IUserSession;
  userinfo: IUserInfoState;
}

export interface UserAccountScreenEventProps {
  onLogout: () => Promise<void>;
}

export type UserAccountScreenProps = UserAccountScreenDataProps & UserAccountScreenEventProps & NavigationInjectedProps;
