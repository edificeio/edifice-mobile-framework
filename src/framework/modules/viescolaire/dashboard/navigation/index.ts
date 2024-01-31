import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import type { DashboardRelativeScreenNavParams } from '~/framework/modules/viescolaire/dashboard/screens/relative';
import type { DashboardStudentScreenNavParams } from '~/framework/modules/viescolaire/dashboard/screens/student';
import type { DashboardTeacherScreenNavParams } from '~/framework/modules/viescolaire/dashboard/screens/teacher';

export const dashboardRouteNames = {
  relative: `${moduleConfig.routeName}` as 'relative',
  student: `${moduleConfig.routeName}` as 'student',
  teacher: `${moduleConfig.routeName}` as 'teacher',
};
export interface DashboardNavigationParams extends ParamListBase {
  relative: DashboardRelativeScreenNavParams;
  student: DashboardStudentScreenNavParams;
  teacher: DashboardTeacherScreenNavParams;
}
