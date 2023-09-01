import type { Moment } from 'moment';

import type { IEvent } from './events';

export interface IClassCallStudent {
  events: IEvent[];
  exempted: boolean;
  forgottenNotebook: boolean;
  group: string;
  groupName: string;
  id: string;
  lastCourseAbsent: boolean;
  name: string;
}

export interface IClassCall {
  courseId: string;
  endDate: Moment;
  startDate: Moment;
  stateId: number;
  structureId: string;
  students: IClassCallStudent[];
  subjectId: string;
}
