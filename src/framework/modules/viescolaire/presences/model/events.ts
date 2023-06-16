export enum EventType {
  ABSENCE = 1,
  LATENESS = 2,
  DEPARTURE = 3,
}

export interface IEvent {
  id: number;
  comment: string;
  typeId: EventType;
  endDate: moment.Moment;
  reasonId: number | null;
  startDate: moment.Moment;
}

export interface IHistoryEvent {
  endDate: moment.Moment;
  period: string;
  startDate: moment.Moment;
  typeId: number;
}

export interface IForgottenNotebook {
  date: moment.Moment;
}

export interface IIncident {
  date: moment.Moment;
  protagonist: {
    label: string;
  };
  label: string;
}

export interface IPunishment {
  createdAt: moment.Moment;
  delayAt: moment.Moment;
  endDate: moment.Moment;
  label: string;
  punishmentCategoryId: number;
  startDate: moment.Moment;
}
