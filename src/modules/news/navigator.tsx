import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import NewsDetailsScreen from './screens/NewsDetailsScreen';

import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

export const timelineRoutes = addViewTrackingToStackRoutes({
  [`${moduleConfig.routeName}/details`]: {
    screen: NewsDetailsScreen,
  },
});

// export default () =>
//   createStackNavigator(
//     {
//       ...timelineRoutes,
//     },
//     {
//       headerMode: 'none',
//     },
//   );
