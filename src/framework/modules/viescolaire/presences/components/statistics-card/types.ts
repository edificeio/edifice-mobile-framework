import { Event, EventType } from '~/framework/modules/viescolaire/presences/model';

export interface StatisticsCardProps {
  events: Event[];
  type: EventType;
  recoveryMethod?: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
  navigateToEventList: (events: Event[], key: string) => void;
}
