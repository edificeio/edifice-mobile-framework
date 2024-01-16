import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/scrapbook/module-config';
import { ScrapbookDetailsScreenNavParams } from '~/framework/modules/scrapbook/screens/details';
import { ScrapbookHomeScreenNavParams } from '~/framework/modules/scrapbook/screens/home';

export const scrapbookRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  details: `${moduleConfig.routeName}/details` as 'details',
};
export interface ScrapbookNavigationParams extends ParamListBase {
  home: ScrapbookHomeScreenNavParams;
  details: ScrapbookDetailsScreenNavParams;
}
