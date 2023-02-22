import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import type { DiaryHomeworkScreenNavParams } from '~/framework/modules/viescolaire/diary/screens/homework';
import type { DiaryHomeworkListScreenNavParams } from '~/framework/modules/viescolaire/diary/screens/homework-list';
import type { DiarySessionScreenNavParams } from '~/framework/modules/viescolaire/diary/screens/session';
import type { DiaryTimetableScreenNavParams } from '~/framework/modules/viescolaire/diary/screens/timetable';

export const diaryRouteNames = {
  homework: `${moduleConfig.routeName}/homework` as 'homework',
  homeworkList: `${moduleConfig.routeName}/homework-list` as 'homeworkList',
  session: `${moduleConfig.routeName}/session` as 'session',
  timetable: `${moduleConfig.routeName}/timetable` as 'timetable',
};
export interface DiaryNavigationParams extends ParamListBase {
  homework: DiaryHomeworkScreenNavParams;
  homeworkList: DiaryHomeworkListScreenNavParams;
  session: DiarySessionScreenNavParams;
  timetable: DiaryTimetableScreenNavParams;
}
