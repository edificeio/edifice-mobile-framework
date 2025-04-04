import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import type { MediacentreFilterScreenNavParams } from '~/framework/modules/mediacentre/screens/filter';
import type { MediacentreHomeScreenNavParams } from '~/framework/modules/mediacentre/screens/home';
import type { MediacentreResourceListScreenNavParams } from '~/framework/modules/mediacentre/screens/resource-list';

export const mediacentreRouteNames = {
  filter: `${moduleConfig.routeName}/filter` as 'filter',
  home: `${moduleConfig.routeName}` as 'home',
  resourceList: `${moduleConfig.routeName}/resource-list` as 'resourceList',
};
export interface MediacentreNavigationParams extends ParamListBase {
  home: MediacentreHomeScreenNavParams;
  filter: MediacentreFilterScreenNavParams;
  resourceList: MediacentreResourceListScreenNavParams;
}
