import { createStackNavigator } from 'react-navigation-stack';

import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import moduleConfig from './moduleConfig';
import FormDistributionScreen from './screens/distribution';
import FormDistributionListScreen from './screens/distribution-list';

export const timelineRoutes = addViewTrackingToStackRoutes({
  [moduleConfig.routeName]: {
    screen: FormDistributionListScreen,
  },
  [`${moduleConfig.routeName}/distribution`]: {
    screen: FormDistributionScreen,
  },
});

export default () =>
  createStackNavigator(
    {
      ...timelineRoutes,
    },
    {
      headerMode: 'none',
    },
  );
