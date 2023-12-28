import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/support/module-config';
import { SupportScreenNavParams } from '~/framework/modules/support/screens/create-ticket/types';

export const supportRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface SupportNavigationParams extends ParamListBase {
  home: SupportScreenNavParams;
}
