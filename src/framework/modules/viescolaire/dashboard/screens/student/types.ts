import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DashboardStudentScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  evaluations: AsyncState<IDevoirsMatieres>;
  homeworks: AsyncState<IHomeworkMap>;
  levels: ILevel[];
  structureId?: string;
  userId?: string;
  fetchDevoirs: (structureId: string, childId: string) => Promise<IDevoirsMatieres>;
  fetchHomeworks: (structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
  updateHomeworkProgress: (homeworkId: number, isDone: boolean) => Promise<void>;
}

export interface DashboardStudentScreenNavParams {}

export interface DashboardStudentScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'student'>,
    DashboardStudentScreenProps {
  // @scaffolder add HOC props here
}
