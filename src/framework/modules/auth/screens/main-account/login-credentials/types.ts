import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

import { LoginCredentialsScreenDispatchProps, LoginCredentialsScreenStoreProps } from '../../../templates/login-credentials/types';

export interface AuthLoginCredentialsScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, 'loginCredentials'>,
    LoginCredentialsScreenStoreProps,
    LoginCredentialsScreenDispatchProps {}
