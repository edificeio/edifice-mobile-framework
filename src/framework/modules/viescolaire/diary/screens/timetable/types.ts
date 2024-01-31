import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  fetchDiaryCoursesAction,
  fetchDiaryHomeworksAction,
  fetchDiarySessionsAction,
  fetchDiarySlotsAction,
} from '~/framework/modules/viescolaire/diary/actions';
import type { IDiaryCourse, IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import type { ISlot } from '~/framework/modules/viescolaire/edt/model';
import type { AsyncState } from '~/framework/util/redux/async';

export interface DiaryTimetableScreenProps {}

export interface DiaryTimetableScreenNavParams {}

export interface DiaryTimetableScreenStoreProps {
  courses: AsyncState<IDiaryCourse[]>;
  homeworks: AsyncState<IHomeworkMap>;
  sessions: AsyncState<IDiarySession[]>;
  slots: AsyncState<ISlot[]>;
  structureId?: string;
  userId?: string;
}

export interface DiaryTimetableScreenDispatchProps {
  tryFetchCourses: (...args: Parameters<typeof fetchDiaryCoursesAction>) => Promise<IDiaryCourse[]>;
  tryFetchHomeworks: (...args: Parameters<typeof fetchDiaryHomeworksAction>) => Promise<IHomeworkMap>;
  tryFetchSessions: (...args: Parameters<typeof fetchDiarySessionsAction>) => Promise<IDiarySession[]>;
  tryFetchSlots: (...args: Parameters<typeof fetchDiarySlotsAction>) => Promise<ISlot[]>;
}

export type DiaryTimetableScreenPrivateProps = DiaryTimetableScreenProps &
  DiaryTimetableScreenStoreProps &
  DiaryTimetableScreenDispatchProps &
  NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.timetable>;
