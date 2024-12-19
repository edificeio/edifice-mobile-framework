import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/news/module-config';
import { NewsDetailsScreenNavParams } from '~/framework/modules/news/screens/details';
import type { NewsHomeScreenNavParams } from '~/framework/modules/news/screens/home';

export const newsRouteNames = {
  details: `${moduleConfig.routeName}/details` as 'details',
  home: `${moduleConfig.routeName}` as 'home',
};
export interface NewsNavigationParams extends ParamListBase {
  home: NewsHomeScreenNavParams;
  details: NewsDetailsScreenNavParams;
}
