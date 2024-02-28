import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface AuthLoginCredentialsScreenPrivateProps extends NativeStackScreenProps<AuthNavigationParams, 'loginCredentials'> {}
