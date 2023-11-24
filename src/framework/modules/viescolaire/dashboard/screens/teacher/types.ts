import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { loadStoredStructureAction } from '~/framework/modules/viescolaire/dashboard/actions';
import type { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import type { fetchPresencesCoursesAction } from '~/framework/modules/viescolaire/presences/actions';
import type { Course } from '~/framework/modules/viescolaire/presences/model';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface DashboardTeacherScreenProps {}

export interface DashboardTeacherScreenNavParams {}

export interface DashboardTeacherScreenStoreProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  courses: { [key: string]: Course[] };
  initialLoadingState: AsyncPagedLoadingState;
  structureIds: string[];
  session?: ISession;
  userId?: string;
  userType?: UserType;
}

export interface DashboardTeacherScreenDispatchProps {
  tryFetchCourses: (...args: Parameters<typeof fetchPresencesCoursesAction>) => Promise<Course[]>;
  tryLoadStoredStructure: (...args: Parameters<typeof loadStoredStructureAction>) => Promise<string | undefined>;
}

export type DashboardTeacherScreenPrivateProps = DashboardTeacherScreenProps &
  DashboardTeacherScreenStoreProps &
  DashboardTeacherScreenDispatchProps &
  NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.teacher>;
