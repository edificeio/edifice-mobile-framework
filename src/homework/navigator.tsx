import { createStackNavigator } from 'react-navigation-stack';

import HomeworkInitialScreen from './containers/HomeworkInitialScreen';
import HomeworkExplorerScreen from './containers/HomeworkExplorerScreen';
import HomeworkTaskListScreen from './containers/HomeworkTaskListScreen';
import HomeworkTaskDetailsScreen from './containers/HomeworkTaskDetailsScreen';
import config from './config';

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
