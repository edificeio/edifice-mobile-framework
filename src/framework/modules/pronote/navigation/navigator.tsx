import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/mainNavigation';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { PronoteNavigationParams, pronoteRouteNames } from '.';
import moduleConfig from '../moduleConfig';
import PronoteCarnetDeBordScreen, { computeNavBar as carnetDeBordNavBar } from '../screens/CarnetDeBord';
import PronoteCarnetDeBordDetailsScreen, { computeNavBar as carnetDeBordDetailsNavBar } from '../screens/CarnetDeBordDetails';
import PronoteConnectorRedirectScreen, { computeNavBar as connectorRedirectNavBar } from '../screens/ConnectorRedirect';
import PronoteConnectorSelectorScreen, { computeNavBar as connectorSelectorNavBar } from '../screens/ConnectorSelector';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<PronoteNavigationParams>(moduleConfig.routeName, Stack => {
    // <Stack.Screen name={pronoteRouteNames.home} component={PronoteHomeScreen} options={homeNavBar} initialParams={{}} />

    const screens: React.ReactElement[] = [];

    // If widgets are available, the module shows Carnet de Bord as home
    if (widgets.length > 0) {
      screens.push(
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBord}
          name={pronoteRouteNames.carnetDeBord}
          component={PronoteCarnetDeBordScreen}
          options={carnetDeBordNavBar}
          initialParams={undefined}
        />,
        <Stack.Screen
          key={pronoteRouteNames.carnetDeBordDetails}
          name={pronoteRouteNames.carnetDeBordDetails}
          component={PronoteCarnetDeBordDetailsScreen}
          options={carnetDeBordDetailsNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = pronoteRouteNames.carnetDeBord;
    }

    // If no widget, and if multiple connectors, the user will have to choose one to redirect
    else if (apps.length > 1) {
      screens.push(
        <Stack.Screen
          key={pronoteRouteNames.connectorSelector}
          name={pronoteRouteNames.connectorSelector}
          component={PronoteConnectorSelectorScreen}
          options={connectorSelectorNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = pronoteRouteNames.connectorSelector;
    } /* widgets.length <= 0 && apps.length <= 1 */ else {
      moduleConfig.routeName = pronoteRouteNames.connectorRedirect;
    }

    // In every situation, redirect screen must be available
    screens.push(
      <Stack.Screen
        key={pronoteRouteNames.connectorRedirect}
        name={pronoteRouteNames.connectorRedirect}
        component={PronoteConnectorRedirectScreen}
        options={connectorRedirectNavBar}
        initialParams={{}}
      />,
    );

    return <>{screens}</>;
  });
