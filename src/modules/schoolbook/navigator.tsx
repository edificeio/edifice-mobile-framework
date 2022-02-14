import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import { SchoolbookWordDetailsScreenRouter } from './screens/SchoolbookWordDetailsScreen';

export const timelineRoutes = {
  [`${moduleConfig.routeName}/details`]: {
    // This one does not use addViewTrackingToStackRoutes. That is self-managed
    screen: SchoolbookWordDetailsScreenRouter,
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
