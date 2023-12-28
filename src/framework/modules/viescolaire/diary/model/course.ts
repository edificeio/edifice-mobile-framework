import { Moment } from 'moment';

export interface IDiaryCourse {
  classes: string[];
  color: string;
  endDate: Moment;
  groups: string[];
  id: string;
  roomLabels: string[];
  startDate: Moment;
  subject: {
    code: string;
    externalId: string;
    id: string;
    name: string;
    rank: number;
  };
  subjectId: string;
  teacherIds: string[];
}
