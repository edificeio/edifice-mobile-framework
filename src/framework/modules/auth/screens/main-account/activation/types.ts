import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { ActivationScreenDispatchProps, ActivationScreenStoreProps } from '~/framework/modules/auth/templates/activation/types';

export interface AuthActivationScreenProps {}

export interface AuthActivationScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.activation>,
    AuthActivationScreenProps,
    ActivationScreenDispatchProps,
    ActivationScreenStoreProps {}
