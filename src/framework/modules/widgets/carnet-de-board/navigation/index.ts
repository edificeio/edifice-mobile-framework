import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/widgets/carnet-de-board/module-config';
import type { CarnetDeBordScreenNavParams as PronoteCarnetDeBordScreenNavParams } from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord';
import type { CarnetDeBordDetailsScreenNavigationParams as PronoteCarnetDeBordDetailsScreenNavParams } from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord-details';

export const pronoteRouteNames = {
  carnetDeBord: `${moduleConfig.routeName}/home` as 'carnetDeBord',
  carnetDeBordDetails: `${moduleConfig.routeName}/details` as 'carnetDeBordDetails',
  carnetDeBordModal: `${moduleConfig.routeName}` as 'carnetDeBordModal',
};
export interface PronoteNavigationParams extends ParamListBase {
  carnetDeBordModal: undefined;
  carnetDeBord: PronoteCarnetDeBordScreenNavParams;
  carnetDeBordDetails: PronoteCarnetDeBordDetailsScreenNavParams;
}
