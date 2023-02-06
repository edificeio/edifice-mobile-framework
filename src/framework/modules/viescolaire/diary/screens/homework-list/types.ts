import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';
import { IPersonnelList } from '~/modules/viescolaire/dashboard/state/personnel';

export interface DiaryHomeworkListScreenProps {
  homeworks: IHomeworkMap;
  sessions: IDiarySession[];
  personnel: IPersonnelList;
  childId: string;
  structureId: string;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  userType: string;
  fetchHomeworks: any;
  fetchPersonnel: any;
  fetchSessions: any;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  updateHomeworkProgress?: any;
}

export interface DiaryHomeworkListScreenNavParams {
  diaryTitle?: string;
}

export interface DiaryHomeworkListScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'homework-list'>,
    DiaryHomeworkListScreenProps {
  // @scaffolder add HOC props here
}
