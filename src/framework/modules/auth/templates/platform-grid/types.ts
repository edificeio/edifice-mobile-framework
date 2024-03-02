import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';
import { StackNavigationAction } from '~/framework/navigation/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformGridScreenProps {
  getNextRoute: (platform: Platform) => StackNavigationAction;
}

export type AuthPlatformGridScreenNavParams = undefined;

export interface AuthPlatformGridScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationTemplatesParams, 'platforms'>,
    AuthPlatformGridScreenProps {}
