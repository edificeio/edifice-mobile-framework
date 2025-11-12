import * as React from 'react';

import { PronoteNavigationParams, pronoteRouteNames } from '.';

import moduleConfig from '~/framework/modules/widgets/carnet-de-board/module-config';
import CarnetDeBoardModalScreen from '~/framework/modules/widgets/carnet-de-board/screens/carnet-de-board-modal';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

export default (() =>
  createModuleNavigator<PronoteNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of apps & widgets.
     */

    const screens: React.ReactElement[] = [];

    // If widgets are available, the module shows Carnet de Bord as home
    screens.push(
      <Stack.Group key="modal" screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBordModal}
          name={pronoteRouteNames.carnetDeBordModal}
          component={CarnetDeBoardModalScreen}
          options={{ headerShown: false }}
          initialParams={undefined}
        />
      </Stack.Group>,
    );
    moduleConfig.routeName = pronoteRouteNames.carnetDeBordModal;

    return <>{screens}</>;
  })) as AnyNavigableModule['getRoot'];

setModalModeForRoutes([pronoteRouteNames.carnetDeBordModal]);
