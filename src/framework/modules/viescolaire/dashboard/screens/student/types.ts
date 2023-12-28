import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUser } from '~/framework/modules/auth/model';
import type {
  fetchCompetencesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
} from '~/framework/modules/viescolaire/competences/actions';
import type { ICompetence, IDevoir, ISubject } from '~/framework/modules/viescolaire/competences/model';
import type { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import type {
  fetchDiaryHomeworksAction,
  fetchDiaryTeachersAction,
  updateDiaryHomeworkProgressAction,
} from '~/framework/modules/viescolaire/diary/actions';
import type { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { AsyncState } from '~/framework/util/redux/async';

export interface DashboardStudentScreenProps {}

export interface DashboardStudentScreenNavParams {}

export interface DashboardStudentScreenStoreProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  competences: ICompetence[];
  devoirs: IDevoir[];
  homeworks: AsyncState<IHomeworkMap>;
  isFetchingDevoirs: boolean;
  subjects: ISubject[];
  classes?: string[];
  structureId?: string;
  userId?: string;
}

export interface DashboardStudentScreenDispatchProps {
  tryFetchCompetences: (...args: Parameters<typeof fetchCompetencesAction>) => Promise<ICompetence[]>;
  tryFetchDevoirs: (...args: Parameters<typeof fetchCompetencesDevoirsAction>) => Promise<IDevoir[]>;
  tryFetchHomeworks: (...args: Parameters<typeof fetchDiaryHomeworksAction>) => Promise<IHomeworkMap>;
  tryFetchSubjects: (...args: Parameters<typeof fetchCompetencesSubjectsAction>) => Promise<ISubject[]>;
  tryFetchTeachers: (...args: Parameters<typeof fetchDiaryTeachersAction>) => Promise<IUser[]>;
  tryUpdateHomeworkProgress: (...args: Parameters<typeof updateDiaryHomeworkProgressAction>) => Promise<void>;
}

export type DashboardStudentScreenPrivateProps = DashboardStudentScreenProps &
  DashboardStudentScreenStoreProps &
  DashboardStudentScreenDispatchProps &
  NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.student>;
