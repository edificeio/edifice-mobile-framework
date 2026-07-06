import { PartialRoute, Route } from '@react-navigation/native';

import { ModuleScreenProps } from '~/app/navigation/types';
import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformsScreenProps extends ModuleScreenProps<'auth/platforms'> {
  getNextRoute: (
    platform: Platform,
  ) => PartialRoute<
    Route<'auth/add-account/login/credentials' | 'auth/add-account/login/redirect' | 'auth/add-account/login/wayf'>
  >;
}
