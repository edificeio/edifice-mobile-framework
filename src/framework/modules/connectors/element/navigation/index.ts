import { ParamListBase } from '@react-navigation/native';

import type { ConnectorRedirectScreenNavParams } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/element/module-config';

export const elementRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface ElementNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams;
}
