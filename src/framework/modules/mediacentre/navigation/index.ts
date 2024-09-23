import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import type { MediacentreHomeScreenNavParams } from '~/framework/modules/mediacentre/screens/home';

export const mediacentreRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface MediacentreNavigationParams extends ParamListBase {
  home: MediacentreHomeScreenNavParams;
}
