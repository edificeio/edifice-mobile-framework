import { ParamListBase } from '@react-navigation/native';

import type { ConnectorRedirectScreenNavParams } from '~/framework/modules/connectors/common/redirect-screen/types';
import moduleConfig from '~/framework/modules/connectors/pronote/module-config';
import type { ConnectorSelectorScreenNavParams } from '~/framework/modules/connectors/pronote/screens/connector-selector';

export const pronoteRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface PronoteNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams | ConnectorSelectorScreenNavParams;
}
