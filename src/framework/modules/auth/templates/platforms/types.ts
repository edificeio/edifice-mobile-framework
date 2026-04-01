import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModuleNavigationParams } from '~/app/module/types';
import { ModuleScreenProps } from '~/app/navigation/types';
import type authModule from '~/framework/modules/auth';
import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformsScreenProps extends ModuleScreenProps<'auth/platforms'> {
  getNextRoute: <RouteName extends keyof ModuleNavigationParams<typeof authModule>>(
    _navigation: NativeStackScreenProps<ModuleNavigationParams<typeof authModule>, RouteName>['navigation'],
    platform: Platform,
  ) => Parameters<typeof _navigation.dispatch>[0];
}
