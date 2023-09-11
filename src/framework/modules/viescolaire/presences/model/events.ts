import type { Moment } from 'moment';

export enum EventType {
  ABSENCE = 1,
  LATENESS = 2,
  DEPARTURE = 3,
}

export enum HistoryEventType {
  DEPARTURE,
  FORGOTTEN_NOTEBOOK,
  INCIDENT,
  LATENESS,
  NO_REASON,
  PUNISHMENT,
  REGULARIZED,
  STATEMENT_ABSENCE,
  UNREGULARIZED,
}

export interface IEvent {
  comment: string;
  endDate: Moment;
  id: number;
  reasonId: number | null;
  startDate: Moment;
  typeId: EventType;
}

export interface IHistoryEvent {
  comment: string;
  endDate: Moment;
  id: string;
  startDate: Moment;
  type: HistoryEventType;
  typeId: number;
  reasonLabel?: string;
}

export type IAbsence = Pick<IHistoryEvent, 'id' | 'type'> & {
  description: string;
  endDate: Moment;
  startDate: Moment;
  studentFirstName: string;
};

export type IForgottenNotebook = Pick<IHistoryEvent, 'id' | 'type'> & {
  date: Moment;
};

export type IIncident = Pick<IHistoryEvent, 'id' | 'type'> & {
  date: Moment;
  description: string;
  protagonist: {
    label: string;
  };
  typeLabel: string;
};

export type IPunishment = Pick<IHistoryEvent, 'id' | 'type'> & {
  createdAt: Moment;
  endDate: Moment;
  punishmentCategoryId: number;
  startDate: Moment;
  typeLabel: string;
};

export const compareEvents = (
  a: IAbsence | IHistoryEvent | IIncident | IPunishment | IForgottenNotebook,
  b: IAbsence | IHistoryEvent | IIncident | IPunishment | IForgottenNotebook,
): number => {
  const firstDate = 'startDate' in a ? a.startDate : a.date;
  const secondDate = 'startDate' in b ? b.startDate : b.date;
  return secondDate.diff(firstDate);
};
