import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '../../navigation';

export interface UserProfileScreenProps {}

export interface UserProfileScreenNavParams {}

export interface UserProfileScreenStoreProps {}

export interface UserProfileScreenDispatchProps {}

export interface UserProfileScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'profile'>,
    UserProfileScreenProps,
    UserProfileScreenStoreProps,
    UserProfileScreenDispatchProps {}
