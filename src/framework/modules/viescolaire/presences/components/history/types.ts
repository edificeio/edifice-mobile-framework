import type { UserType } from '~/framework/modules/auth/service';
import type { Event } from '~/framework/modules/viescolaire/presences/model';

export interface HistoryProps {
  isRefreshing: boolean;
  events: Event[];
  userType?: UserType;
}
