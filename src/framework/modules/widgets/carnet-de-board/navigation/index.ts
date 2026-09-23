import { NavigatorScreenParams, ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/widgets/carnet-de-board/module-config';
import type { CarnetDeBordDetailsScreenNavigationParams as PronoteCarnetDeBordDetailsScreenNavParams } from '~/framework/modules/widgets/carnet-de-board/screens/details';

export const pronoteRouteNames = {
  carnetDeBord: `${moduleConfig.routeName}/home` as 'carnetDeBord',
  carnetDeBordDetails: `${moduleConfig.routeName}/details` as 'carnetDeBordDetails',
  carnetDeBordModal: `${moduleConfig.routeName}` as 'carnetDeBordModal',
};
export interface PronoteNavigationParams extends ParamListBase {
  carnetDeBordModal: NavigatorScreenParams<PronoteNavigationParams> | undefined;
  carnetDeBord: undefined;
  carnetDeBordDetails: PronoteCarnetDeBordDetailsScreenNavParams;
}
