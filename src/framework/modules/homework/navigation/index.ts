import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/homework/module-config';
import { HomeworkCreateScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkCreateScreen';
import { HomeworkExplorerScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import { HomeworkInitialScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkInitialScreen';
import { HomeworkSelectScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkSelectScreen';
import { IHomeworkTaskDetailsScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkTaskDetailsScreen';
import { HomeworkTaskListScreenNavigationParams } from '~/framework/modules/homework/screens/HomeworkTaskListScreen';

export const homeworkRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  homeworkCreate: `${moduleConfig.routeName}/create` as 'homeworkCreate',
  homeworkExplorer: `${moduleConfig.routeName}/explorer` as 'homeworkExplorer',
  homeworkSelect: `${moduleConfig.routeName}/select` as 'homeworkSelect',
  homeworkTaskDetails: `${moduleConfig.routeName}/details` as 'homeworkTaskDetails',
  homeworkTaskList: `${moduleConfig.routeName}/tasks` as 'homeworkTaskList',
};
export interface HomeworkNavigationParams extends ParamListBase {
  home: HomeworkInitialScreenNavigationParams;
  homeworkCreate: HomeworkCreateScreenNavigationParams;
  homeworkExplorer: HomeworkExplorerScreenNavigationParams;
  homeworkSelect: HomeworkSelectScreenNavigationParams;
  homeworkTaskDetails: IHomeworkTaskDetailsScreenNavigationParams;
  homeworkTaskList: HomeworkTaskListScreenNavigationParams;
}
