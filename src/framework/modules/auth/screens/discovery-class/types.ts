import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface AuthDiscoveryClassScreenProps {}

export interface AuthDiscoveryClassScreenNavParams {}

export interface AuthDiscoveryClassScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, 'discoveryClass'>,
    AuthDiscoveryClassScreenProps {}
