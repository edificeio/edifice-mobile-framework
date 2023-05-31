import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiaryHomeworkListScreenProps {
  homeworks: IHomeworkMap;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  sessions: IDiarySession[];
  teachers: IUser[];
  childId?: string;
  structureId?: string;
  userType?: string;
  fetchChildHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchChildSessions: (childId: string, startDate: string, endDate: string) => Promise<IDiarySession[]>;
  fetchHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchSessions: (structureId: string, startDate: string, endDate: string) => Promise<IDiarySession[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
  updateHomeworkProgress: (homeworkId: number, isDone: boolean) => Promise<void>;
}

export interface DiaryHomeworkListScreenNavParams {}

export interface DiaryHomeworkListScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'homeworkList'>,
    DiaryHomeworkListScreenProps {
  // @scaffolder add HOC props here
}
