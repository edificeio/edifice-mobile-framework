import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

export interface AuthAccountSelectionScreenNavParams {}

export interface AuthAccountSelectionScreenProps {}

export interface AuthAccountSelectionScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.accountSelection>,
    AuthAccountSelectionScreenProps {}
