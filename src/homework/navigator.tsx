import { createStackNavigator } from 'react-navigation-stack';

import config from './config';
import HomeworkExplorerScreen from './containers/HomeworkExplorerScreen';
import HomeworkInitialScreen from './containers/HomeworkInitialScreen';
import HomeworkTaskDetailsScreen from './containers/HomeworkTaskDetailsScreen';
import HomeworkTaskListScreen from './containers/HomeworkTaskListScreen';

export const homeworkViews = {
  [`${config.name}`]: {
    screen: HomeworkInitialScreen,
  },
  [`${config.name}/explorer`]: {
    screen: HomeworkExplorerScreen,
  },
  [`${config.name}/tasks`]: {
    screen: HomeworkTaskListScreen,
  },
  [`${config.name}/details`]: {
    screen: HomeworkTaskDetailsScreen,
  },
};

export default createStackNavigator(homeworkViews, {
  headerMode: 'none',
});
