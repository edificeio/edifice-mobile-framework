import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ICourseListState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DiaryTimetableScreenProps {
  courses: ICourseListState;
  homeworks: AsyncState<IHomeworkMap>;
  sessions: AsyncState<IDiarySession[]>;
  slots: AsyncState<ISlot[]>;
  structureId?: string;
  userId?: string;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => Promise<IHomeworkMap>;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => Promise<IDiarySession[]>;
  fetchSlots: (structureId: string) => Promise<ISlot[]>;
  fetchTeacherCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string,
  ) => Promise<ICourseListState>;
}

export interface DiaryTimetableScreenNavParams {}

export interface DiaryTimetableScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'timetable'>,
    DiaryTimetableScreenProps {
  // @scaffolder add HOC props here
}
