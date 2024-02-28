import { CommonActions, StackActionType } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';
import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformGridScreenProps {
  getNextRoute: (platform: Platform) => CommonActions.Action | StackActionType;
}

export type AuthPlatformGridScreenNavParams = undefined;

export interface AuthPlatformGridScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationTemplatesParams, 'platforms'>,
    AuthPlatformGridScreenProps {}
