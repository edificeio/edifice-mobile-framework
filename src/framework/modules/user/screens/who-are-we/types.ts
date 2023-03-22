import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '../../navigation';

export interface UserWhoAreWeScreenProps {}

export interface UserWhoAreWeScreenNavParams {}

export interface UserWhoAreWeScreenStoreProps {}

export interface UserWhoAreWeScreenDispatchProps {}

export interface UserWhoAreWeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'whoAreWe'>,
    UserWhoAreWeScreenProps,
    UserWhoAreWeScreenStoreProps,
    UserWhoAreWeScreenDispatchProps {}
