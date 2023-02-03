import { ICourseTag } from './course-tag';

export interface IEdtCourse {
  id: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  subjectId: string;
  roomLabels: string[];
  teacherIds: string[];
  classes: string[];
  groups: string[];
  exceptionnal: string;
  subject: {
    code: string;
    externalId: string;
    id: string;
    name: string;
    rank: number;
  };
  color: string;
  tags: ICourseTag[];
  tagIds: number[];
}
