import { createStackNavigator } from 'react-navigation-stack';

import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import moduleConfig from './moduleConfig';
import CarnetDeBordScreen from './screens/CarnetDeBord';
import CarnetDeBordDetailsScreen from './screens/CarnetDeBordDetails';
import ConnectorRedirectScreen from './screens/ConnectorRedirect';
import ConnectorSelectorScreen from './screens/ConnectorSelector';

export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const routes: Parameters<typeof createStackNavigator>['0'] = {};

  // Add Functional screens

  if (matchingWidgets.length > 0) {
    routes[`${moduleConfig.routeName}/carnetDeBord`] = {
      screen: CarnetDeBordScreen,
    };
    routes[`${moduleConfig.routeName}/carnetDeBord/details`] = {
      screen: CarnetDeBordDetailsScreen,
    };
  } else if (matchingApps.length > 1) {
    // Many connectors => show connector select
    routes[`${moduleConfig.routeName}/select`] = {
      screen: ConnectorSelectorScreen,
      params: {
        connectors: matchingApps,
      },
    };
  }

  // Redirection route (only use from myApps)
  routes[`${moduleConfig.routeName}/redirect`] = {
    screen: ConnectorRedirectScreen,
    params:
      matchingApps.length === 1
        ? {
            connector: matchingApps[0],
          }
        : undefined,
  };

  // Return stack navigator
  return createStackNavigator(addViewTrackingToStackRoutes(routes), {
    headerMode: 'none',
  });
};
