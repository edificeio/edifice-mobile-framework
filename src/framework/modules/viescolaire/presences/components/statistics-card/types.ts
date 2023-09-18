import { Event, EventType } from '~/framework/modules/viescolaire/presences/model';

export interface StatisticsCardProps {
  events: Event[];
  type: EventType;
}
