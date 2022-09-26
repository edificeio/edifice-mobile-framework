import moment from 'moment';
import querystring from 'querystring';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ICourseList } from '~/modules/viescolaire/dashboard/state/courses';

export type ICourseListBackend = {
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
}[];

const coursesListAdapter = (data: ICourseListBackend): ICourseList => {
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
  }));
};

export const coursesService = {
  getCoursesFromClass: async (structureId: string, startDate: moment.Moment, endDate: moment.Moment, groups: string[]) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const courses = await fetchJSONWithCache(
      `/viescolaire/common/courses/${structureId}/${startDateString}/${endDateString}?${querystring.stringify({
        group: groups,
        union: true,
      })}`,
    );
    return coursesListAdapter(courses);
  },
  getCoursesFromTeacher: async (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const courses = await fetchJSONWithCache(
      `/viescolaire/common/courses/${structureId}/${startDateString}/${endDateString}?${querystring.stringify({
        teacherId,
        union: true,
      })}`,
    );
    return coursesListAdapter(courses);
  },
};
