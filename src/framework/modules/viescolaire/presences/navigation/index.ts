import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import type { PresencesCallScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/call';
import type { PresencesCallListScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/call-list';
import type { PresencesDeclareAbsenceScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/declare-absence';
import type { PresencesDeclareEventScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/declare-event';
import type { PresencesHistoryScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/history';
import type { PresencesStatisticsScreenNavParams } from '~/framework/modules/viescolaire/presences/screens/statistics';

export const presencesRouteNames = {
  call: `${moduleConfig.routeName}/call` as 'call',
  callList: `${moduleConfig.routeName}/call-list` as 'callList',
  declareAbsence: `${moduleConfig.routeName}/declare-absence` as 'declareAbsence',
  declareEvent: `${moduleConfig.routeName}/declare-event` as 'declareEvent',
  history: `${moduleConfig.routeName}/history` as 'history',
  statistics: `${moduleConfig.routeName}/statistics` as 'statistics',
};
export interface PresencesNavigationParams extends ParamListBase {
  call: PresencesCallScreenNavParams;
  callList: PresencesCallListScreenNavParams;
  declareAbsence: PresencesDeclareAbsenceScreenNavParams;
  declareEvent: PresencesDeclareEventScreenNavParams;
  history: PresencesHistoryScreenNavParams;
  statistics: PresencesStatisticsScreenNavParams;
}
