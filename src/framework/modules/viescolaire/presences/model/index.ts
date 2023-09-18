import type { Moment } from 'moment';

export interface Absence extends EventBase {
  description: string;
  endDate: Moment;
  startDate: Moment;
  studentFirstName: string;
}

export interface Call {
  courseId: string;
  endDate: Moment;
  startDate: Moment;
  stateId: CallState;
  structureId: string;
  students: CallStudent[];
  subjectId: string;
}

export interface CallEvent {
  comment: string;
  endDate: Moment;
  id: number;
  reasonId: number | null;
  startDate: Moment;
  typeId: CallEventType;
}

export enum CallEventType {
  ABSENCE = 1,
  LATENESS = 2,
  DEPARTURE = 3,
}

export enum CallState {
  TODO = 1,
  IN_PROGRESS = 2,
  DONE = 3,
}

export interface CallStudent {
  events: CallEvent[];
  exempted: boolean;
  forgottenNotebook: boolean;
  group: string;
  groupName: string;
  id: string;
  lastCourseAbsent: boolean;
  name: string;
}

export type ChildEvents = {
  DEPARTURE: CallEvent[];
  LATENESS: CallEvent[];
  NO_REASON: CallEvent[];
  REGULARIZED: CallEvent[];
  UNREGULARIZED: CallEvent[];
};

export interface CommonEvent extends EventBase {
  comment: string;
  endDate: Moment;
  startDate: Moment;
  typeId: number;
  reasonLabel?: string;
}

export interface Course {
  callId: number;
  callStateId: CallState;
  classes: string[];
  endDate: Moment;
  groups: string[];
  id: string;
  roomLabels: string[];
  startDate: Moment;
  structureId: string;
  subjectId: string;
}

export type Event = Absence | CommonEvent | ForgottenNotebook | Incident | Punishment;

export interface EventBase {
  id: string;
  type: EventType;
}

export interface EventReason {
  id: number;
  label: string;
  reasonTypeId: number;
}

export enum EventType {
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

export interface ForgottenNotebook extends EventBase {
  date: Moment;
}

export interface Incident extends EventBase {
  date: Moment;
  description: string;
  protagonist: {
    label: string;
  };
  typeLabel: string;
}

export interface PresencesUserChild {
  birth: string;
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  structures: {
    classes: {
      id: string;
      name: string;
      structure: string;
    }[];
    id: string;
    name: string;
  }[];
}

export interface Punishment extends EventBase {
  createdAt: Moment;
  endDate: Moment;
  punishmentCategoryId: number;
  startDate: Moment;
  typeLabel: string;
}

export interface Statistics {
  DEPARTURE: {
    events: CommonEvent[];
    total: number;
  };
  FORGOTTEN_NOTEBOOK?: {
    events: ForgottenNotebook[];
    total: number;
  };
  INCIDENT?: {
    events: Incident[];
    total: number;
  };
  LATENESS: {
    events: CommonEvent[];
    total: number;
  };
  NO_REASON: {
    events: CommonEvent[];
    total: number;
  };
  PUNISHMENT?: {
    events: Punishment[];
    total: number;
  };
  REGULARIZED: {
    events: CommonEvent[];
    total: number;
  };
  UNREGULARIZED: {
    events: CommonEvent[];
    total: number;
  };
  recoveryMethod: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
}

export const compareEvents = (a: Event, b: Event): number => {
  const firstDate = 'startDate' in a ? a.startDate : a.date;
  const secondDate = 'startDate' in b ? b.startDate : b.date;
  return secondDate.diff(firstDate);
};
