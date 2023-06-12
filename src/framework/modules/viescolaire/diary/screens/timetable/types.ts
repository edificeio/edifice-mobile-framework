import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Moment } from 'moment';

import { IDiaryCourse, IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DiaryTimetableScreenProps {
  courses: AsyncState<IDiaryCourse[]>;
  homeworks: AsyncState<IHomeworkMap>;
  sessions: AsyncState<IDiarySession[]>;
  slots: AsyncState<ISlot[]>;
  structureId?: string;
  userId?: string;
  fetchCourses: (structureId: string, teacherId: string, startDate: Moment, endDate: Moment) => Promise<IDiaryCourse[]>;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => Promise<IHomeworkMap>;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => Promise<IDiarySession[]>;
  fetchSlots: (structureId: string) => Promise<ISlot[]>;
}

export interface DiaryTimetableScreenNavParams {}

export interface DiaryTimetableScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'timetable'>,
    DiaryTimetableScreenProps {
  // @scaffolder add HOC props here
}
