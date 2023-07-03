import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchPresencesHistoryAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { IPresencesNotification } from '~/framework/modules/viescolaire/presences/notif-handler';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesHistoryScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesHistoryScreenNavParams {
  notification?: IPresencesNotification;
}

export interface PresencesHistoryScreenStoreProps {
  history: IHistory;
  schoolYear: ISchoolYear | undefined;
  terms: ITerm[];
  classes?: string[];
  hasPresencesCreateAbsenceRight?: boolean;
  structureId?: string;
  studentId?: string;
  userId?: string;
  userType?: string;
}

export interface PresencesHistoryScreenDispatchProps {
  tryFetchHistory: (...args: Parameters<typeof fetchPresencesHistoryAction>) => Promise<IHistory>;
  tryFetchSchoolYear: (...args: Parameters<typeof fetchPresencesSchoolYearAction>) => Promise<ISchoolYear>;
  tryFetchTerms: (...args: Parameters<typeof fetchPresencesTermsAction>) => Promise<ITerm[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchPresencesUserChildrenAction>) => Promise<IUserChild[]>;
}

export type PresencesHistoryScreenPrivateProps = PresencesHistoryScreenProps &
  PresencesHistoryScreenStoreProps &
  PresencesHistoryScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>;
