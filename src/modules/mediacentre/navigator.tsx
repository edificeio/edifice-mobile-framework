import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import MediacentreHomeScreen from './screens/MediacentreHomeScreen';

export default () =>
  createStackNavigator(
    {
      [moduleConfig.routeName]: {
        screen: MediacentreHomeScreen,
      },
    },
    {
      headerMode: 'none',
    },
  );
