import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/widgets/screen-time/module-config';
import type { ScreenTimeHomeScreenNavParams } from '~/framework/modules/widgets/screen-time/screens/home';

export const screenTimeRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface ScreenTimeNavigationParams extends ParamListBase {
  home: ScreenTimeHomeScreenNavParams;
}
