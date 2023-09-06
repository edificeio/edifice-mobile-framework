import type { Moment } from 'moment';

export interface ISlot {
  endHour: Moment;
  id: string;
  name: string;
  startHour: Moment;
}
