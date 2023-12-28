import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUser } from '~/framework/modules/auth/model';
import type {
  fetchDiaryHomeworksAction,
  fetchDiaryHomeworksFromChildAction,
  fetchDiarySessionsAction,
  fetchDiarySessionsFromChildAction,
  fetchDiaryTeachersAction,
  updateDiaryHomeworkProgressAction,
} from '~/framework/modules/viescolaire/diary/actions';
import type { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiaryHomeworkListScreenProps {}

export interface DiaryHomeworkListScreenNavParams {}

export interface DiaryHomeworkListScreenStoreProps {
  homeworks: IHomeworkMap;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  sessions: IDiarySession[];
  teachers: IUser[];
  childId?: string;
  structureId?: string;
  userType?: string;
}

export interface DiaryHomeworkListScreenDispatchProps {
  tryFetchChildHomeworks: (...args: Parameters<typeof fetchDiaryHomeworksFromChildAction>) => Promise<IHomeworkMap>;
  tryFetchChildSessions: (...args: Parameters<typeof fetchDiarySessionsFromChildAction>) => Promise<IDiarySession[]>;
  tryFetchHomeworks: (...args: Parameters<typeof fetchDiaryHomeworksAction>) => Promise<IHomeworkMap>;
  tryFetchSessions: (...args: Parameters<typeof fetchDiarySessionsAction>) => Promise<IDiarySession[]>;
  tryFetchTeachers: (...args: Parameters<typeof fetchDiaryTeachersAction>) => Promise<IUser[]>;
  updateHomeworkProgress: (...args: Parameters<typeof updateDiaryHomeworkProgressAction>) => Promise<void>;
}

export type DiaryHomeworkListScreenPrivateProps = DiaryHomeworkListScreenProps &
  DiaryHomeworkListScreenStoreProps &
  DiaryHomeworkListScreenDispatchProps &
  NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homeworkList>;
