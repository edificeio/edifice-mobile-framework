import moment from "moment";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { ICoursesList } from "../state/teacherCourses";

export type ICoursesListBackend = Array <{
  classes: string;
  structureId: string;
  startDate:  string;
  endDate:  string;
  roomLabels: string;
}>

const coursesAdapter: (data: ICoursesListBackend) => ICoursesList = data => {
  let result = [] as ICoursesList;
  if (!data) return result;
  result = data.map(item => ({
    classes: item.classes,
    structureId: item.structureId,
    startDate: moment(item.startDate),
    endDate: moment(item.endDate),
    roomLabels: item.roomLabels,
  }))
  return result;
};

export const coursesService = {
  get: async (teacher: string, structure: string, start: string, end: string) => {
    const data = coursesAdapter(
      await fetchJSONWithCache(`/presences/courses?teacher=${teacher}&structure=${structure}&start=${start}&end=${end}`)
    );
    return data;
  }
}
