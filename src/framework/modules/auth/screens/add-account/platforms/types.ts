import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export type AuthPlatformsAddAccountScreenNavParams = undefined;

export interface AuthPlatformsAddAccountScreenPrivateProps extends NativeStackScreenProps<AuthNavigationParams, 'platforms'> {}
