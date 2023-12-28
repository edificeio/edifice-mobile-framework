import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import type { EdtHomeScreenNavParams } from '~/framework/modules/viescolaire/edt/screens/home';

export const edtRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface EdtNavigationParams extends ParamListBase {
  home: EdtHomeScreenNavParams;
}
