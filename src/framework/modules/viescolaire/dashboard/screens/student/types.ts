import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { ICompetence, IDevoir, IDomaine, ILevel, ISubject } from '~/framework/modules/viescolaire/competences/model';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DashboardStudentScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  classes: string[];
  competences: ICompetence[];
  devoirs: AsyncState<IDevoir[]>;
  domaines: IDomaine[];
  homeworks: AsyncState<IHomeworkMap>;
  levels: ILevel[];
  subjects: ISubject[];
  structureId?: string;
  userId?: string;
  fetchCompetences: (studentId: string, classId: string) => Promise<ICompetence[]>;
  fetchDevoirs: (structureId: string, childId: string) => Promise<IDevoir[]>;
  fetchDomaines: (classId: string) => Promise<IDomaine[]>;
  fetchHomeworks: (structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
  fetchSubjects: (structureId: string) => Promise<ISubject[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
  updateHomeworkProgress: (homeworkId: number, isDone: boolean) => Promise<void>;
}

export interface DashboardStudentScreenNavParams {}

export interface DashboardStudentScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'student'>,
    DashboardStudentScreenProps {
  // @scaffolder add HOC props here
}
