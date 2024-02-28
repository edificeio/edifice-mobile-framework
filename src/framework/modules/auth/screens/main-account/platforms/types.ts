import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export type AuthPlatformsScreenNavParams = undefined;

export interface AuthPlatformsScreenPrivateProps extends NativeStackScreenProps<AuthNavigationParams, 'platforms'> {}
