import type { Moment } from 'moment';

export interface IEdtCourse {
  classes: string[];
  endDate: Moment;
  groups: string[];
  id: string;
  roomLabels: string[];
  startDate: Moment;
  subject: {
    id: string;
    name: string;
    rank: number;
  };
  tags: {
    id: number;
    label: string;
    abbreviation: string;
  }[];
  teacherIds: string[];
}
