import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/myAppMenu/moduleConfig';

export const myAppsRouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home',
};
export interface IMyAppsNavigationParams extends ParamListBase {
  Home: undefined;
}
