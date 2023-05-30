import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { IDevoir, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DashboardRelativeScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  devoirs: AsyncState<IDevoir[]>;
  homeworks: AsyncState<IHomeworkMap>;
  hasRightToCreateAbsence: boolean;
  subjects: ISubject[];
  userChildren: IUserChild[];
  childId?: string;
  structureId?: string;
  userId?: string;
  fetchDevoirs: (structureId: string, childId: string) => Promise<IDevoir[]>;
  fetchHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchSubjects: (structureId: string) => Promise<ISubject[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
  fetchUserChildren: (structureId: string, userId: string) => Promise<IUserChild[]>;
}

export interface DashboardRelativeScreenNavParams {}

export interface DashboardRelativeScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'relative'>,
    DashboardRelativeScreenProps {
  // @scaffolder add HOC props here
}
