import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { CarnetDeBordScreenNavParams as PronoteCarnetDeBordScreenNavParams } from '../screens/carnet-de-bord';
import type { CarnetDeBordDetailsScreenNavigationParams as PronoteCarnetDeBordDetailsScreenNavParams } from '../screens/carnet-de-bord-details';
import type { IConnectorRedirectScreenNavigationParams as PronoteConnectorRedirectScreenNavParams } from '../screens/connector-redirect';
import type { IConnectorSelectorScreenNavParams as PronoteConnectorSelectorScreenNavParams } from '../screens/connector-selector';

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
