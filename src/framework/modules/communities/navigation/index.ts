import { ParamListBase } from '@react-navigation/native';

import { CommunitiesListScreen } from '../screens/list';

import moduleConfig from '~/framework/modules/communities/module-config';

export const communitiesRouteNames = {
  list: `${moduleConfig.routeName}` as 'list',
};
export interface CommunitiesNavigationParams extends ParamListBase {
  list: CommunitiesListScreen.NavParams;
}
