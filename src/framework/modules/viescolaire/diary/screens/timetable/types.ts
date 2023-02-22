import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ICourseListState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DiaryTimetableScreenProps {
  courses: ICourseListState;
  sessions: AsyncState<IDiarySession[]>;
  homeworks: AsyncState<IHomeworkMap>;
  slots: AsyncState<ISlot[]>;
  structure: { id: string };
  teacherId: string;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSlots: (structureId: string) => void;
}

export interface DiaryTimetableScreenNavParams {}

export interface DiaryTimetableScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'timetable'>,
    DiaryTimetableScreenProps {
  // @scaffolder add HOC props here
}
