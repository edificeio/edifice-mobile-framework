import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/myAppMenu/module-config';

export const myAppsRouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home',
  widgets: `${moduleConfig.routeName}/widgets` as 'widgets',
};
export interface IMyAppsNavigationParams extends ParamListBase {
  Home: undefined;
}
