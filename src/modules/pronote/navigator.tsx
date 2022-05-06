import { createStackNavigator } from 'react-navigation-stack';

import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import ConnectorContainer from './containers/ConnectorContainer';

export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const routes: Parameters<typeof createStackNavigator>['0'] = {};

  // Add Connector redirections screens
  matchingApps.forEach(app => {
    routes[`Redirect-${app.address}`] = {
      screen: ConnectorContainer,
      params: {
        app,
      },
    };
  });

  // Add Functional screens
  const hasWidget = matchingWidgets.length > 0;
  if (matchingApps.length <= 1) {
    // On connector => direct redirect
    if (hasWidget) {
    } else {
    }
  } else {
    // Many connectors => show connector select
    if (hasWidget) {
    } else {
    }
  }

  // Return stack navigator
  return createStackNavigator(routes, {
    headerMode: 'none',
  });
};
