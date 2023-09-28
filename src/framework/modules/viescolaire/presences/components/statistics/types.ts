import type { ISession } from '~/framework/modules/auth/model';
import type { ITerm } from '~/framework/modules/viescolaire/common/model';
import type { Event, Statistics } from '~/framework/modules/viescolaire/presences/model';

export interface StatisticsProps {
  isRefreshing: boolean;
  statistics: Statistics;
  terms: ITerm[];
  session?: ISession;
  openEventList: (events: Event[], key: string) => void;
}
