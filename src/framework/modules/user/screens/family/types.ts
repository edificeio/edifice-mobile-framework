import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserFamilyScreenProps {}

export interface UserFamilyScreenNavParams {
  mode: 'children' | 'relatives';
}

export interface UserFamilyScreenStoreProps {}

export interface UserFamilyScreenDispatchProps {}

export interface UserFamilyScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'family'>,
    UserFamilyScreenProps,
    UserFamilyScreenStoreProps,
    UserFamilyScreenDispatchProps {}
