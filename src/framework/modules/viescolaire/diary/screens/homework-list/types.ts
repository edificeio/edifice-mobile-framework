import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiaryHomeworkListScreenProps {
  homeworks: IHomeworkMap;
  sessions: IDiarySession[];
  teachers: IUser[];
  childId: string;
  structureId: string;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  userType: string;
  fetchHomeworks: any;
  fetchTeachers: any;
  fetchSessions: any;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  updateHomeworkProgress?: any;
}

export interface DiaryHomeworkListScreenNavParams {
  diaryTitle?: string;
}

export interface DiaryHomeworkListScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'homeworkList'>,
    DiaryHomeworkListScreenProps {
  // @scaffolder add HOC props here
}
