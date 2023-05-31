import { ParamListBase } from '@react-navigation/native';

import type { ConnectorRedirectScreenNavParams } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/peertube/module-config';

export const peertubeRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface PeertubeNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams;
}
