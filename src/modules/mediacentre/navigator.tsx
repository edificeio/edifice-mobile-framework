import { createStackNavigator } from 'react-navigation-stack';

import Dashboard from './containers/Dashboard';

export default () =>
  createStackNavigator(
    {
      Mediacentre: Dashboard,
    }, {
      headerMode: 'none',
    }
  );
