import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { ChangePasswordScreenDispatchProps } from '~/framework/modules/auth/templates/change-password/types';

export interface AuthChangePasswordScreenProps {}
export interface AuthChangePasswordScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountChangePassword>,
    AuthChangePasswordScreenProps,
    ChangePasswordScreenDispatchProps {}
