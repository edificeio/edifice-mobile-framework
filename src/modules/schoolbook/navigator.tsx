import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import SchoolbookWordDetailsScreen from './screens/SchoolbookWordDetailsScreen';
import SchoolbookWordListScreen from './screens/SchoolbookWordListScreen';

export const timelineRoutes = {
  [`${moduleConfig.routeName}`]: {
    screen: SchoolbookWordListScreen,
  },
  [`${moduleConfig.routeName}/details`]: {
    screen: SchoolbookWordDetailsScreen,
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
