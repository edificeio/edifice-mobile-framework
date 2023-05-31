import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/news/module-config';
import type { NewsDetailsScreenNavParams } from '~/framework/modules/news/screens/news-details';

export const newsRouteNames = {
  newsDetails: `${moduleConfig.routeName}/news-details` as 'newsDetails',
};
export interface NewsNavigationParams extends ParamListBase {
  newsDetails: NewsDetailsScreenNavParams;
}
