import { createStackNavigator } from 'react-navigation-stack';

import Timetable from './containers/Timetable';
import moduleConfig from './moduleConfig';

export const edtRoutes = {
  [moduleConfig.routeName]: {
    screen: Timetable,
  },
};

export default () =>
  createStackNavigator(
    {
      ...edtRoutes,
    },
    {
      headerMode: 'none',
    },
  );
