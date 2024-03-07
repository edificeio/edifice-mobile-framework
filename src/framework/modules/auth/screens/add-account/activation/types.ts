import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { ActivationScreenDispatchProps } from '~/framework/modules/auth/templates/activation/types';

export interface AuthActivationAddAccountScreenProps {}

export interface AuthActivationAddAccountScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountActivation>,
    AuthActivationAddAccountScreenProps,
    ActivationScreenDispatchProps {}
