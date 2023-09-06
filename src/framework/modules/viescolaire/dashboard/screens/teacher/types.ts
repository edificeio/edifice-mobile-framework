import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserType } from '~/framework/modules/auth/service';
import type { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';

export interface DashboardTeacherScreenProps {}

export interface DashboardTeacherScreenNavParams {}

export interface DashboardTeacherScreenStoreProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  structureId?: string;
  userType?: UserType;
}

export interface DashboardTeacherScreenDispatchProps {}

export type DashboardTeacherScreenPrivateProps = DashboardTeacherScreenProps &
  DashboardTeacherScreenStoreProps &
  DashboardTeacherScreenDispatchProps &
  NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.teacher>;
