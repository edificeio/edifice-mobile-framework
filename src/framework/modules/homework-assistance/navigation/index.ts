import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import type { HomeworkAssistanceHomeScreenNavParams } from '~/framework/modules/homework-assistance/screens/home';
import type { HomeworkAssistanceRequestScreenNavParams } from '~/framework/modules/homework-assistance/screens/request';

export const homeworkAssistanceRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  request: `${moduleConfig.routeName}/request` as 'request',
};
export interface HomeworkAssistanceNavigationParams extends ParamListBase {
  home: HomeworkAssistanceHomeScreenNavParams;
  request: HomeworkAssistanceRequestScreenNavParams;
}
