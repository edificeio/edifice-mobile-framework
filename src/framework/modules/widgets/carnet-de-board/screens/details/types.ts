import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model';
import type { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';

export interface CarnetDeBordDetailsScreenNavigationParams {
  data: ICarnetDeBord;
  type: CarnetDeBordSection;
}

export type CarnetDeBordDetailsScreenProps = NativeStackScreenProps<
  PronoteNavigationParams,
  typeof pronoteRouteNames.carnetDeBordDetails
>;
