import * as React from 'react';

import { PronoteNavigationParams, pronoteRouteNames } from '../navigation';

import { PageView } from '~/framework/components/page';
import PronoteCarnetDeBordScreen, {
  computeNavBar as carnetDeBordNavBar,
} from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord';
import PronoteCarnetDeBordDetailsScreen, {
  computeNavBar as carnetDeBordDetailsNavBar,
} from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-bord-details';
import { getTypedRootStack } from '~/framework/navigation/navigators';

export default function CarnetDeBoardModalScreen() {
  const Stack = getTypedRootStack<PronoteNavigationParams>();
  const RootStack = getTypedRootStack();

  return (
    <PageView>
      <RootStack.Navigator>
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBord}
          name={pronoteRouteNames.carnetDeBord}
          component={PronoteCarnetDeBordScreen}
          options={carnetDeBordNavBar}
          initialParams={undefined}
        />
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBordDetails}
          name={pronoteRouteNames.carnetDeBordDetails}
          component={PronoteCarnetDeBordDetailsScreen}
          options={carnetDeBordDetailsNavBar}
          initialParams={{}}
        />
      </RootStack.Navigator>
    </PageView>
  );
}
