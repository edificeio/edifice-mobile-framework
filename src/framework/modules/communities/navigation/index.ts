import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/communities/module-config';
import type { CommunitiesHomeScreenNavParams } from '~/framework/modules/communities/screens/home';

export const communitiesRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface CommunitiesNavigationParams extends ParamListBase {
  home: CommunitiesHomeScreenNavParams;
}
