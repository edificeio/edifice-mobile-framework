import type { AccountTyoe } from '~/framework/modules/auth/model';
import type { Event } from '~/framework/modules/viescolaire/presences/model';

export interface HistoryProps {
  isRefreshing: boolean;
  events: Event[];
  userType?: AccountTyoe;
}
