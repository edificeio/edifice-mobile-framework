import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';
import {
  AuthLoginCredentialsScreenDispatchProps,
  AuthLoginCredentialsScreenStoreProps,
} from '~/framework/modules/auth/templates/login-credentials/types';

export interface AuthLoginCredentialsScreenPrivateProps
  extends
    NativeStackScreenProps<AuthNavigationParams, 'loginCredentials'>,
    AuthLoginCredentialsScreenStoreProps,
    AuthLoginCredentialsScreenDispatchProps {}
