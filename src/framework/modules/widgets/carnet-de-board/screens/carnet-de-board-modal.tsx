import * as React from 'react';

import { createLeafStackNavigator } from '~/app/navigation/leaf-stack';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';
import PronoteCarnetDeBordScreen, {
  computeNavBar as carnetDeBordNavBar,
} from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord';
import PronoteCarnetDeBordDetailsScreen, {
  computeNavBar as carnetDeBordDetailsNavBar,
} from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord-details';

const LeafStack = createLeafStackNavigator<PronoteNavigationParams>();

export default function CarnetDeBoardModalScreen() {
  return (
    <LeafStack.Navigator>
      <LeafStack.Screen
        key={pronoteRouteNames.carnetDeBord}
        name={pronoteRouteNames.carnetDeBord}
        component={PronoteCarnetDeBordScreen}
        options={carnetDeBordNavBar}
        initialParams={undefined}
      />
      <LeafStack.Screen
        key={pronoteRouteNames.carnetDeBordDetails}
        name={pronoteRouteNames.carnetDeBordDetails}
        component={PronoteCarnetDeBordDetailsScreen}
        options={carnetDeBordDetailsNavBar}
        initialParams={{}}
      />
    </LeafStack.Navigator>
  );
}
