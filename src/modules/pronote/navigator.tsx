import { createStackNavigator } from 'react-navigation-stack';



import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';



import ConnectorContainer from './containers/ConnectorContainer';
import ConnectorSelector from './containers/ConnectorSelector';
import moduleConfig from './moduleConfig';


export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const routes: Parameters<typeof createStackNavigator>['0'] = {};

  matchingApps = [...matchingApps, ...matchingApps]; // DEBUG PURPOSE - REMOVE IT AFTER

  // Add Functional screens

  if (matchingWidgets.length > 2) {
    routes[`${moduleConfig.routeName}/carnetDeBord`] = {
      screen: () => null // ToDo
    };
  } else if (matchingApps.length > 1) {
    // Many connectors => show connector select
    routes[`${moduleConfig.routeName}/select`] = {
      screen: ConnectorSelector,
      params: {
        connectors: matchingApps,
      },
    };
  }

  // Add Connector redirections screens (at last position)
  matchingApps.forEach(app => {
    routes[`${moduleConfig.routeName}/redirect`] = {
      screen: ConnectorContainer,
      params: {
        app,
      },
    };
  });

  // Return stack navigator
  return createStackNavigator(routes, {
    headerMode: 'none',
  });
};