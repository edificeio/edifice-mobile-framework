import { IEvent } from './events';

export type IChildEvents = {
  DEPARTURE: IEvent[];
  LATENESS: IEvent[];
  NO_REASON: IEvent[];
  REGULARIZED: IEvent[];
  UNREGULARIZED: IEvent[];
};

export type IChildrenEvents = {
  [studentId: string]: IChildEvents;
};
