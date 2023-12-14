import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/scrapbook/module-config';
import type { ScrapbookDetailsScreenNavParams } from '~/framework/modules/scrapbook/screens/details';
import type { ScrapbookHomeScreenNavParams } from '~/framework/modules/scrapbook/screens/home';

export const scrapbookRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  details: `${moduleConfig.routeName}/details` as 'details',
};
export interface ScrapbookNavigationParams extends ParamListBase {
  home: ScrapbookHomeScreenNavParams;
  details: ScrapbookDetailsScreenNavParams;
}
