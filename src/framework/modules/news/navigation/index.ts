import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { NewsDetailsScreenNavParams } from '../screens/news-details';

export const newsRouteNames = {
  newsDetails: `${moduleConfig.routeName}/news-details` as 'newsDetails',
};
export interface NewsNavigationParams extends ParamListBase {
  newsDetails: NewsDetailsScreenNavParams;
}
