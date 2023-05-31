import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import type { MediacentreHomeScreenNavigationParams } from '~/framework/modules/mediacentre/screens/MediacentreHomeScreen';

export const mediacentreRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface MediacentreNavigationParams extends ParamListBase {
  home: MediacentreHomeScreenNavigationParams;
}
