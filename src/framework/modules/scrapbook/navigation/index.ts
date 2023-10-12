import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/scrapbook/module-config';
import { ScrapbookDetailsScreenNavParams } from '~/framework/modules/scrapbook/screens/details';

export const scrapbookRouteNames = {
  details: `${moduleConfig.routeName}` as 'details',
};
export interface ScrapbookNavigationParams extends ParamListBase {
  details: ScrapbookDetailsScreenNavParams;
}
