import { ICallEvent } from './events';

export type IChildEvents = {
  DEPARTURE: ICallEvent[];
  LATENESS: ICallEvent[];
  NO_REASON: ICallEvent[];
  REGULARIZED: ICallEvent[];
  UNREGULARIZED: ICallEvent[];
};

export type IChildrenEvents = {
  [studentId: string]: IChildEvents;
};
