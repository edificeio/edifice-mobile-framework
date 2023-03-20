import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import { IAuthorizedViescoApps } from '~/framework/modules/viescolaire/dashboard/model';
import type { DashboardNavigationParams } from '~/framework/modules/viescolaire/dashboard/navigation';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { AsyncState } from '~/framework/util/redux/async';

export interface DashboardRelativeScreenProps {
  authorizedViescoApps: IAuthorizedViescoApps;
  evaluations: AsyncState<IDevoirsMatieres>;
  homeworks: AsyncState<IHomeworkMap>;
  hasRightToCreateAbsence: boolean;
  levels: ILevel[];
  childId?: string;
  structureId?: string;
  userId?: string;
  fetchDevoirs: (structureId: string, childId: string) => Promise<IDevoirsMatieres>;
  fetchHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => Promise<IHomeworkMap>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
}

export interface DashboardRelativeScreenNavParams {}

export interface DashboardRelativeScreenPrivateProps
  extends NativeStackScreenProps<DashboardNavigationParams, 'relative'>,
    DashboardRelativeScreenProps {
  // @scaffolder add HOC props here
}
