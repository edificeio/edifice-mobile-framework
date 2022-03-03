import moment from 'moment';
import querystring from 'querystring';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ICoursesRegister } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { ICoursesList } from '~/modules/viescolaire/presences/state/teacherCourses';

export type ICoursesListBackend = {
  id: string;
  allowRegister: boolean;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: string;
  endDate: string;
  roomLabels: string[];
  groups: string[];
  registerId: string;
  splitSlot: boolean;
}[];

const coursesAdapter: (data: ICoursesListBackend) => ICoursesList = data => {
  let result = [] as ICoursesList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    allowRegister: item.allowRegister,
    subjectId: item.subjectId,
    classes: item.classes,
    structureId: item.structureId,
    startDate: moment(item.startDate),
    endDate: moment(item.endDate),
    roomLabels: item.roomLabels,
    groups: item.groups,
    registerId: item.registerId,
    splitSlot: item.splitSlot,
  }));
  return result;
};

export const coursesService = {
  get: async (teacher: string, structure: string, start: string, end: string, multiple_slot?: boolean) => {
    return coursesAdapter(
      await fetchJSONWithCache(
        `/presences/courses?${querystring.stringify({
          teacher,
          structure,
          start,
          end,
          forgotten_registers: false,
          multiple_slot,
        })}`,
      ),
    );
  },
};

export type ICoursesRegisterBackend = {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: string;
  end_date: string;
  councellor_input: boolean;
};

const coursesRegisterAdapter: (data: ICoursesRegisterBackend) => ICoursesRegister = data => {
  let result = {} as ICoursesRegister;
  if (!data) return result;
  result = {
    id: data.id,
    course_id: data.course_id,
    structure_id: data.structure_id,
    state_id: data.state_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    councellor_input: data.councellor_input,
  };
  return result;
};

export const coursesRegisterService = {
  get: async course_data => {
    return coursesRegisterAdapter(await fetchJSONWithCache(`/presences/registers`, { body: course_data, method: 'post' }));
  },
};
