import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';

export const myAppsRouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home',
};

// Where a module that has no tab of its own is reached from.
export const myAppsTabRouteName = computeTabRouteName(moduleConfig.name);
export interface IMyAppsNavigationParams extends ParamListBase {
  Home: {
    tabBarVisible?: boolean;
  };
}
