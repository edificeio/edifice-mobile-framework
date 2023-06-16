import type { Moment } from 'moment';

export enum EventType {
  ABSENCE = 1,
  LATENESS = 2,
  DEPARTURE = 3,
}

export interface IEvent {
  id: number;
  comment: string;
  typeId: EventType;
  endDate: Moment;
  reasonId: number | null;
  startDate: Moment;
}

export interface IHistoryEvent {
  endDate: Moment;
  period: string;
  startDate: Moment;
  typeId: number;
}

export interface IForgottenNotebook {
  date: Moment;
}

export interface IIncident {
  date: Moment;
  protagonist: {
    label: string;
  };
  label: string;
}

export interface IPunishment {
  createdAt: Moment;
  delayAt: Moment;
  endDate: Moment;
  label: string;
  punishmentCategoryId: number;
  startDate: Moment;
}
