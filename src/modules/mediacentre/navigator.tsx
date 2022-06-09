import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen';

export default () =>
  createStackNavigator(
    {
      Mediacentre: HomeScreen,
    },
    {
      headerMode: 'none',
    },
  );
