import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { LvsHomeScreenNavParams } from '../screens/home';

export const lvsRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface LvsNavigationParams extends ParamListBase {
  home: LvsHomeScreenNavParams;
}
