import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUserListItem } from '~/framework/components/UserList';
import type { ISession } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { fetchPresencesHistoryAction } from '~/framework/modules/viescolaire/presences/actions';
import type { Event } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { IPresencesNotification } from '~/framework/modules/viescolaire/presences/notif-handler';

export interface PresencesHistoryScreenProps {}

export interface PresencesHistoryScreenNavParams {
  notification?: IPresencesNotification;
}

export interface PresencesHistoryScreenStoreProps {
  events: Event[];
  children?: IUserListItem[];
  hasPresencesCreateAbsenceRight?: boolean;
  session?: ISession;
  userId?: string;
  userType?: UserType;
}

export interface PresencesHistoryScreenDispatchProps {
  tryFetchHistory: (...args: Parameters<typeof fetchPresencesHistoryAction>) => Promise<Event[]>;
}

export type PresencesHistoryScreenPrivateProps = PresencesHistoryScreenProps &
  PresencesHistoryScreenStoreProps &
  PresencesHistoryScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>;
