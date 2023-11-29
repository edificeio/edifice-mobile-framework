import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserLangScreenProps {}

export interface UserLangScreenNavParams {}

export interface UserLangScreenStoreProps {}

export interface UserLangScreenDispatchProps {}

export interface UserLangScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'lang'>,
    UserLangScreenProps,
    UserLangScreenStoreProps,
    UserLangScreenDispatchProps {}
