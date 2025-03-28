import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/nabook/module-config';
import type { NabookHomeScreenNavParams } from '~/framework/modules/nabook/screens/home';

export const nabookRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};

export interface NabookNavigationParams extends ParamListBase {
  home: NabookHomeScreenNavParams;
}
