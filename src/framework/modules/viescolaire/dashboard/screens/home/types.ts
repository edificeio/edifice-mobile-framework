import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserType } from '~/framework/modules/auth/service';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/Dashboard/navigation';

import { IAuthorizedViescoApps } from './screen';

export interface DashboardHomeScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  userType?: UserType;
}

export interface DashboardHomeScreenNavParams {}

export interface DashboardHomeScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'home'>,
    DashboardHomeScreenProps {
  // @scaffolder add HOC props here
}
