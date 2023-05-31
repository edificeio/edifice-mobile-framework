import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { ICompetence, IDevoir, IDomaine, ILevel, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DashboardRelativeScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  competences: ICompetence[];
  devoirs: AsyncState<IDevoir[]>;
  domaines: IDomaine[];
  homeworks: AsyncState<IHomeworkMap>;
  hasRightToCreateAbsence: boolean;
  levels: ILevel[];
  subjects: ISubject[];
  userChildren: IUserChild[];
  childId?: string;
  structureId?: string;
  userId?: string;
  fetchCompetences: (studentId: string, classId: string) => Promise<ICompetence[]>;
  fetchDevoirs: (structureId: string, childId: string) => Promise<IDevoir[]>;
  fetchDomaines: (classId: string) => Promise<IDomaine[]>;
  fetchHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
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
