import type { Moment } from 'moment';

export interface ICourse {
  allowRegister: boolean;
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
