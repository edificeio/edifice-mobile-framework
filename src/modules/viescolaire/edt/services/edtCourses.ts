import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ICourseTag, IEdtCourseList } from '~/modules/viescolaire/edt/state/edtCourses';

export type IEdtCourseListBackend = {
  _id: string;
  classes: string[];
  groups: string[];
  teacherIds: string[];
  roomLabels: string[];
  startCourse: string;
  endCourse: string;
  exceptionnal: string;
  subjectId: string;
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
}[];

const edtCoursesListAdapter = (data: IEdtCourseListBackend): IEdtCourseList => {
  return data.map(course => ({
    id: course._id,
    teacherIds: course.teacherIds,
    roomLabels: course.roomLabels,
    exceptionnal: course.exceptionnal,
    subjectId: course.subjectId,
    subject: course.subject,
    classes: course.classes,
    groups: course.groups,
    startDate: moment(course.startCourse),
    endDate: moment(course.endCourse),
    color: course.color,
    tags: course.tags,
    tagIds: course.tagIds,
  }));
};

export const edtCoursesService = {
  getEdtCoursesFromClass: async (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    groups: string[],
    groupsIds: string[],
  ) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const bodyData = {
      teacherIds: [],
      union: true,
      groupExternalIds: [],
      groupIds: groupsIds,
      groupNames: groups,
    };
    const courses = await fetchJSONWithCache(`/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`, {
      method: 'POST',
      body: JSON.stringify(bodyData),
    });
    return edtCoursesListAdapter(courses);
  },
  getEdtCoursesFromTeacher: async (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const bodyData = {
      teacherIds: [teacherId],
      union: true,
      groupExternalIds: [],
      groupIds: [],
      groupNames: [],
    };
    const courses = await fetchJSONWithCache(`/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`, {
      method: 'POST',
      body: JSON.stringify(bodyData),
    });
    return edtCoursesListAdapter(courses);
  },
};
