import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

export interface AuthAccountSelectionScreenNavParams {}

export interface AuthAccountSelectionScreenProps {}

export interface AuthAccountSelectionScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.accountSelection>,
    AuthAccountSelectionScreenProps {}
