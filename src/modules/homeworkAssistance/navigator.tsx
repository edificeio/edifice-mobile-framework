import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import HomeworkAssistanceHomeScreen from './screens/homework-assistance-home-screen';
import HomeworkAssistanceRequestScreen from './screens/homework-assistance-request-screen';

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
