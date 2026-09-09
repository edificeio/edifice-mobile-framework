import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';

export type CarnetDeBordScreenProps = NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.carnetDeBord>;
