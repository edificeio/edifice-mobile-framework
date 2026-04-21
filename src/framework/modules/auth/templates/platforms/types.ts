import { NavigationRoute } from '@react-navigation/native';

import { ModuleScreenProps, NavigationRootParams } from '~/app/navigation/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformsScreenProps extends ModuleScreenProps<'auth/platforms'> {
  getNextRoute: (platform: Platform) => NavigationRoute<NavigationRootParams, keyof NavigationRootParams>;
}
