import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import HomeworkAssistanceHomeScreen from './screens/home';
import HomeworkAssistanceRequestScreen from './screens/request';

export default () =>
  createStackNavigator(
    {
      [moduleConfig.routeName]: {
        screen: HomeworkAssistanceHomeScreen,
      },
      [`${moduleConfig.routeName}/request`]: {
        screen: HomeworkAssistanceRequestScreen,
      },
    },
    {
      headerMode: 'none',
    },
  );
