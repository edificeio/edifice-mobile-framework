export interface IEdtCourse {
  classes: string[];
  endDate: moment.Moment;
  groups: string[];
  id: string;
  roomLabels: string[];
  startDate: moment.Moment;
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
