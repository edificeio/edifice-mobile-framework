import * as React from 'react';

import { BaseStackScreenLayout } from '~/app/navigation/layout';
import moduleConfig from '~/framework/modules/widgets/carnet-de-board/module-config';
import CarnetDeBordModalScreen from '~/framework/modules/widgets/carnet-de-board/screens/modal';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

import { PronoteNavigationParams, pronoteRouteNames } from '.';

export default (() =>
  createModuleNavigator<PronoteNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of apps & widgets.
     */

    const screens: React.ReactElement[] = [];

    // If widgets are available, the module shows Carnet de Bord as home
    screens.push(
      <Stack.Group key="modal" screenLayout={BaseStackScreenLayout} screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBordModal}
          name={pronoteRouteNames.carnetDeBordModal}
          component={CarnetDeBordModalScreen}
          // the leaf stack inside brings its own bar. iOS still paints an inherited `headerBackground`
          // under a hidden header, which would stack a second line above that bar.
          options={{ headerBackground: undefined, headerShown: false }}
          initialParams={undefined}
        />
      </Stack.Group>,
    );
    moduleConfig.routeName = pronoteRouteNames.carnetDeBordModal;

    return <>{screens}</>;
  })) as AnyNavigableModule['getRoot'];

setModalModeForRoutes([pronoteRouteNames.carnetDeBordModal]);
