import { ParamListBase } from '@react-navigation/native';

import type { ConnectorRedirectScreenNavParams } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/wekan/module-config';

export const wekanRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface WekanNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams;
}
