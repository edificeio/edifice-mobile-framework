import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserType } from '~/framework/modules/auth/service';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';

export interface DashboardTeacherScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  structureId?: string;
  userType?: UserType;
}

export interface DashboardTeacherScreenNavParams {}

export interface DashboardTeacherScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'teacher'>,
    DashboardTeacherScreenProps {
  // @scaffolder add HOC props here
}
