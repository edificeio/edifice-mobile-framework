import {
  HistoryEventType,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';

export interface StatisticsCardProps {
  events: (IForgottenNotebook | IHistoryEvent | IIncident | IPunishment)[];
  type: HistoryEventType;
}
