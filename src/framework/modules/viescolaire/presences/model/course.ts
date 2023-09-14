import type { Moment } from 'moment';

export interface ICourse {
  callId: number;
  classes: string[];
  endDate: Moment;
  groups: string[];
  id: string;
  registerStateId: number;
  roomLabels: string[];
  startDate: Moment;
  structureId: string;
  subjectId: string;
}
