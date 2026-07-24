import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserThemeScreenProps {}

export interface UserThemeScreenNavParams {}

export interface UserThemeScreenPrivateProps extends NativeStackScreenProps<UserNavigationParams, 'theme'>, UserThemeScreenProps {}
