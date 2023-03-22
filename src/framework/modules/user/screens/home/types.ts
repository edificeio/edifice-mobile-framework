import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '../../navigation';
import type { UserState } from '../../reducer';

export interface UserHomeScreenProps {}

export interface UserHomeScreenNavParams {}

export interface UserHomeScreenStoreProps {}

export interface UserHomeScreenDispatchProps {}

export interface UserHomeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'home'>,
    UserHomeScreenProps,
    UserHomeScreenStoreProps,
    UserHomeScreenDispatchProps {}
