import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserSpaceScreenProps {}

export interface UserSpaceScreenNavParams {}

export interface UserSpaceScreenPrivateProps extends NativeStackScreenProps<UserNavigationParams, 'space'>, UserSpaceScreenProps {}
