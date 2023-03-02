import { ParamListBase } from '@react-navigation/native';

import { HomeworkTaskListScreenNavigationParams } from '~/framework/modules/homework/components/HomeworkTaskListScreen';
import { HomeworkExplorerScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import { HomeworkInitialScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkInitialScreen';
import { IHomeworkTaskDetailsScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkTaskDetailsScreen';

import moduleConfig from '../module-config';

export const homeworkRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  homeworkExplorer: `${moduleConfig.routeName}/explorer` as 'homeworkExplorer',
  homeworkTaskDetails: `${moduleConfig.routeName}/details` as 'homeworkTaskDetails',
  homeworkTaskList: `${moduleConfig.routeName}/tasks` as 'homeworkTaskList',
};
export interface HomeworkNavigationParams extends ParamListBase {
  home: HomeworkInitialScreenNavigationParams;
  homeworkExplorer: HomeworkExplorerScreenNavigationParams;
  homeworkTaskDetails: IHomeworkTaskDetailsScreenNavigationParams;
  homeworkTaskList: HomeworkTaskListScreenNavigationParams;
}
