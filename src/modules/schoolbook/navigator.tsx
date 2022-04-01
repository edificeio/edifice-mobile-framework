import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import SchoolbookWordListScreen from './screens/SchoolbookWordListScreen';

export const timelineRoutes = {
  [`${moduleConfig.routeName}`]: {
    screen: SchoolbookWordListScreen,
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
