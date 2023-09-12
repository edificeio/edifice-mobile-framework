import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchPresencesHistoryAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesStatisticsScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesStatisticsScreenNavParams {
  studentId?: string;
}

export interface PresencesStatisticsScreenStoreProps {
  history: IHistory;
  schoolYear: ISchoolYear | undefined;
  terms: ITerm[];
  classes?: string[];
  session?: ISession;
  userId?: string;
  userType?: string;
}

export interface PresencesStatisticsScreenDispatchProps {
  tryFetchHistory: (...args: Parameters<typeof fetchPresencesHistoryAction>) => Promise<IHistory>;
  tryFetchSchoolYear: (...args: Parameters<typeof fetchPresencesSchoolYearAction>) => Promise<ISchoolYear>;
  tryFetchTerms: (...args: Parameters<typeof fetchPresencesTermsAction>) => Promise<ITerm[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchPresencesUserChildrenAction>) => Promise<IUserChild[]>;
}

export type PresencesStatisticsScreenPrivateProps = PresencesStatisticsScreenProps &
  PresencesStatisticsScreenStoreProps &
  PresencesStatisticsScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.statistics>;
