import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import type { PresencesCallScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/call';
import type { PresencesCourseListScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/course-list';
import type { PresencesDeclareAbsenceScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/declare-absence';
import type { PresencesDeclareEventScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/declare-event';
import type { PresencesHistoryScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/history';

export const presencesRouteNames = {
  call: `${moduleConfig.routeName}/call` as 'call',
  courseList: `${moduleConfig.routeName}/course-list` as 'courseList',
  declareAbsence: `${moduleConfig.routeName}/declare-absence` as 'declareAbsence',
  declareEvent: `${moduleConfig.routeName}/declare-event` as 'declareEvent',
  history: `${moduleConfig.routeName}/history` as 'history',
};
export interface PresencesNavigationParams extends ParamListBase {
  call: PresencesCallScreenNavParams;
  courseList: PresencesCourseListScreenNavParams;
  declareAbsence: PresencesDeclareAbsenceScreenNavParams;
  declareEvent: PresencesDeclareEventScreenNavParams;
  history: PresencesHistoryScreenNavParams;
}
