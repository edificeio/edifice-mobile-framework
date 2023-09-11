import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUserListItem } from '~/framework/components/UserList';
import type { ISession } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { fetchPresencesAbsencesAction, fetchPresencesHistoryAction } from '~/framework/modules/viescolaire/presences/actions';
import type {
  IAbsence,
  IForgottenNotebook,
  IHistory,
  IHistoryEvent,
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
  events: (IAbsence | IHistoryEvent | IPunishment | IForgottenNotebook)[];
  children?: IUserListItem[];
  hasPresencesCreateAbsenceRight?: boolean;
  session?: ISession;
  userId?: string;
  userType?: UserType;
}

export interface PresencesHistoryScreenDispatchProps {
  tryFetchAbsences: (...args: Parameters<typeof fetchPresencesAbsencesAction>) => Promise<IAbsence[]>;
  tryFetchHistory: (...args: Parameters<typeof fetchPresencesHistoryAction>) => Promise<IHistory>;
}

export type PresencesHistoryScreenPrivateProps = PresencesHistoryScreenProps &
  PresencesHistoryScreenStoreProps &
  PresencesHistoryScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>;
