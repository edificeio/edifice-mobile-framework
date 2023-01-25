import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../moduleConfig';
import type { CarnetDeBordScreenNavParams as PronoteCarnetDeBordScreenNavParams } from '../screens/CarnetDeBord';
import type { CarnetDeBordDetailsScreenNavigationParams as PronoteCarnetDeBordDetailsScreenNavParams } from '../screens/CarnetDeBordDetails';
import type { IConnectorRedirectScreenNavigationParams as PronoteConnectorRedirectScreenNavParams } from '../screens/ConnectorRedirect';
import type { IConnectorSelectorScreenNavParams as PronoteConnectorSelectorScreenNavParams } from '../screens/ConnectorSelector';

export const pronoteRouteNames = {
  carnetDeBord: `${moduleConfig.routeName}/carnet-de-bord` as 'carnetDeBord',
  carnetDeBordDetails: `${moduleConfig.routeName}/carnet-de-bord/details` as 'carnetDeBordDetails',
  connectorRedirect: `${moduleConfig.routeName}/redirect` as 'connectorRedirect',
  connectorSelector: `${moduleConfig.routeName}/select` as 'connectorSelector',
};
export interface PronoteNavigationParams extends ParamListBase {
  carnetDeBord: PronoteCarnetDeBordScreenNavParams;
  carnetDeBordDetails: PronoteCarnetDeBordDetailsScreenNavParams;
  connectorRedirect: PronoteConnectorRedirectScreenNavParams;
  connectorSelector: PronoteConnectorSelectorScreenNavParams;
}
