import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/lvs/module-config';
import type { LvsHomeScreenNavParams } from '~/framework/modules/lvs/screens/home';

export const lvsRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface LvsNavigationParams extends ParamListBase {
  home: LvsHomeScreenNavParams;
}
