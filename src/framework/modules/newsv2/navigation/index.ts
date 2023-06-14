import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/newsv2/module-config';
import { NewsDetailsScreenNavParams } from '~/framework/modules/newsv2/screens/details';
import type { NewsHomeScreenNavParams } from '~/framework/modules/newsv2/screens/home';

export const newsRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  details: `${moduleConfig.routeName}/details` as 'details',
};
export interface NewsNavigationParams extends ParamListBase {
  home: NewsHomeScreenNavParams;
  details: NewsDetailsScreenNavParams;
}
