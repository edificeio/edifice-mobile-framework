import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchPresencesSchoolYearAction,
  fetchPresencesStatisticsAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { PresencesUserChild, Statistics } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesStatisticsScreenProps {}

export interface PresencesStatisticsScreenNavParams {
  studentId?: string;
}

export interface PresencesStatisticsScreenStoreProps {
  schoolYear: ISchoolYear | undefined;
  statistics: Statistics;
  terms: ITerm[];
  classes?: string[];
  session?: ISession;
  userId?: string;
  userType?: string;
}

export interface PresencesStatisticsScreenDispatchProps {
  tryFetchSchoolYear: (...args: Parameters<typeof fetchPresencesSchoolYearAction>) => Promise<ISchoolYear>;
  tryFetchStatistics: (...args: Parameters<typeof fetchPresencesStatisticsAction>) => Promise<Statistics>;
  tryFetchTerms: (...args: Parameters<typeof fetchPresencesTermsAction>) => Promise<ITerm[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchPresencesUserChildrenAction>) => Promise<PresencesUserChild[]>;
}

export type PresencesStatisticsScreenPrivateProps = PresencesStatisticsScreenProps &
  PresencesStatisticsScreenStoreProps &
  PresencesStatisticsScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.statistics>;
