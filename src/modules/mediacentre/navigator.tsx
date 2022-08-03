import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import MediacentreHomeScreen from './screens/MediacentreHomeScreen';

export const timelineRoutes = {
  [`${moduleConfig.routeName}`]: {
    screen: MediacentreHomeScreen,
  },
};

export default () =>
  createStackNavigator(
    {
      ...timelineRoutes,
    },
    {
      headerMode: 'none',
    },
  );
