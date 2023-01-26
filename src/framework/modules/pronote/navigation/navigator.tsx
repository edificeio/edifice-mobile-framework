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
  createModuleNavigator<PronoteNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of apps & widgets.
     */

    const screens: React.ReactElement[] = [];
    const hasCarnetDeBord = widgets.length > 0;
    const hasMultipleConnectors = apps.length > 1;

    // If widgets are available, the module shows Carnet de Bord as home
    if (hasCarnetDeBord) {
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
    else if (hasMultipleConnectors) {
      screens.push(
        <Stack.Screen
          key={pronoteRouteNames.connectorSelector}
          name={pronoteRouteNames.connectorSelector}
          component={PronoteConnectorSelectorScreen}
          options={connectorSelectorNavBar}
          initialParams={{ connectors: apps }}
        />,
      );
      moduleConfig.routeName = pronoteRouteNames.connectorSelector;
    } /* !hasCarnetDeBord && !hasMultipleConnectors */ else {
      moduleConfig.routeName = pronoteRouteNames.connectorRedirect;
    }

    // In every situation, redirect screen must be available
    screens.push(
      <Stack.Screen
        key={pronoteRouteNames.connectorRedirect}
        name={pronoteRouteNames.connectorRedirect}
        component={PronoteConnectorRedirectScreen}
        options={connectorRedirectNavBar}
        initialParams={
          !hasCarnetDeBord && !hasMultipleConnectors
            ? {
                connector: apps[0],
              }
            : undefined
        }
      />,
    );

    return <>{screens}</>;
  });
