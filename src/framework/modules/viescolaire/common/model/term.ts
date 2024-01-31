import type { Moment } from 'moment';

export interface ITerm {
  startDate: Moment;
  endDate: Moment;
  order: number;
  type: number;
  typeId: number;
}
