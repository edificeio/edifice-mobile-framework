import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession, UserChild } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchPresencesAbsenceStatementsAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesStatisticsAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { Absence, Event, PresencesUserChild, Statistics } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { IPresencesNotification } from '~/framework/modules/viescolaire/presences/notif-handler';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesHistoryScreenProps {}

export interface PresencesHistoryScreenNavParams {
  notification?: IPresencesNotification;
}

export interface PresencesHistoryScreenStoreProps {
  events: Event[];
  initialLoadingState: AsyncPagedLoadingState;
  schoolYear: ISchoolYear | undefined;
  statistics: Statistics;
  terms: ITerm[];
  children?: UserChild[];
  classes?: string[];
  selectedChildId?: string;
  session?: ISession;
  userId?: string;
  userType?: UserType;
}

export interface PresencesHistoryScreenDispatchProps {
  tryFetchAbsenceStatements: (...args: Parameters<typeof fetchPresencesAbsenceStatementsAction>) => Promise<Absence[]>;
  tryFetchSchoolYear: (...args: Parameters<typeof fetchPresencesSchoolYearAction>) => Promise<ISchoolYear>;
  tryFetchStatistics: (...args: Parameters<typeof fetchPresencesStatisticsAction>) => Promise<Statistics>;
  tryFetchTerms: (...args: Parameters<typeof fetchPresencesTermsAction>) => Promise<ITerm[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchPresencesUserChildrenAction>) => Promise<PresencesUserChild[]>;
}

export type PresencesHistoryScreenPrivateProps = PresencesHistoryScreenProps &
  PresencesHistoryScreenStoreProps &
  PresencesHistoryScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>;
