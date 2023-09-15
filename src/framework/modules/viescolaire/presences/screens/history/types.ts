import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUserListItem } from '~/framework/components/UserList';
import type { ISession } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { fetchPresencesHistoryAction } from '~/framework/modules/viescolaire/presences/actions';
import type {
  IAbsence,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';
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
  events: (IAbsence | IForgottenNotebook | IHistoryEvent | IIncident | IPunishment)[];
  children?: IUserListItem[];
  hasPresencesCreateAbsenceRight?: boolean;
  session?: ISession;
  userId?: string;
  userType?: UserType;
}

export interface PresencesHistoryScreenDispatchProps {
  tryFetchHistory: (
    ...args: Parameters<typeof fetchPresencesHistoryAction>
  ) => Promise<(IAbsence | IForgottenNotebook | IHistoryEvent | IIncident | IPunishment)[]>;
}

export type PresencesHistoryScreenPrivateProps = PresencesHistoryScreenProps &
  PresencesHistoryScreenStoreProps &
  PresencesHistoryScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>;
