import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/widgets/cantine/module-config';
import type { CantineHomeScreenNavParams } from '~/framework/modules/widgets/cantine/screens/home';

export const cantineRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface CantineNavigationParams extends ParamListBase {
  home: CantineHomeScreenNavParams;
}
