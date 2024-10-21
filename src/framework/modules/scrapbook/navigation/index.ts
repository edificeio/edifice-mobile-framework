import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/scrapbook/module-config';
import type { ScrapbookDetailsScreenNavParams } from '~/framework/modules/scrapbook/screens/details';
import type { ScrapbookHomeScreenNavParams } from '~/framework/modules/scrapbook/screens/home';

export const scrapbookRouteNames = {
  details: `${moduleConfig.routeName}/details` as 'details',
  home: `${moduleConfig.routeName}` as 'home',
};
export interface ScrapbookNavigationParams extends ParamListBase {
  home: ScrapbookHomeScreenNavParams;
  details: ScrapbookDetailsScreenNavParams;
}
