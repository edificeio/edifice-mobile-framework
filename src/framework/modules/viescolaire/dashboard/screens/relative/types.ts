import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession, IUser } from '~/framework/modules/auth/model';
import type {
  fetchCompetencesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import type { ICompetence, IDevoir, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import type { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import type { fetchDiaryHomeworksFromChildAction, fetchDiaryTeachersAction } from '~/framework/modules/viescolaire/diary/actions';
import type { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import type { fetchPresencesChildrenEventsAction } from '~/framework/modules/viescolaire/presences/actions';
import type { ChildEvents } from '~/framework/modules/viescolaire/presences/model';
import type { AsyncState } from '~/framework/util/redux/async';

export interface DashboardRelativeScreenProps {}

export interface DashboardRelativeScreenNavParams {}

export interface DashboardRelativeScreenStoreProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  childrenEvents: { [key: string]: ChildEvents };
  competences: ICompetence[];
  devoirs: IDevoir[];
  eventCount: number;
  homeworks: AsyncState<IHomeworkMap>;
  isFetchingDevoirs: boolean;
  selectedChildId: string;
  subjects: ISubject[];
  userChildren: IUserChild[];
  childId?: string;
  session?: ISession;
  structureId?: string;
  userId?: string;
}

export interface DashboardRelativeScreenDispatchProps {
  handleClearLevels: () => void;
  tryFetchChildrenEvents: (
    ...args: Parameters<typeof fetchPresencesChildrenEventsAction>
  ) => Promise<{ [key: string]: ChildEvents }>;
  tryFetchCompetences: (...args: Parameters<typeof fetchCompetencesAction>) => Promise<ICompetence[]>;
  tryFetchDevoirs: (...args: Parameters<typeof fetchCompetencesDevoirsAction>) => Promise<IDevoir[]>;
  tryFetchHomeworks: (...args: Parameters<typeof fetchDiaryHomeworksFromChildAction>) => Promise<IHomeworkMap>;
  tryFetchSubjects: (...args: Parameters<typeof fetchCompetencesSubjectsAction>) => Promise<ISubject[]>;
  tryFetchTeachers: (...args: Parameters<typeof fetchDiaryTeachersAction>) => Promise<IUser[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchCompetencesUserChildrenAction>) => Promise<IUserChild[]>;
}

export type DashboardRelativeScreenPrivateProps = DashboardRelativeScreenProps &
  DashboardRelativeScreenStoreProps &
  DashboardRelativeScreenDispatchProps &
  NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.relative>;
