import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import type { DashboardHomeScreenNavParams } from '~/framework/modules/viescolaire/dashboard/screens/home';

export const dashboardRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface DashboardNavigationParams extends ParamListBase {
  home: DashboardHomeScreenNavParams;
}
