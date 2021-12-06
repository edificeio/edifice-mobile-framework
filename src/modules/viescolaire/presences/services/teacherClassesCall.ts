import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IClassesCall } from '~/modules/viescolaire/presences/state/TeacherClassesCall';

export type IClassesCallListBackend = {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: string;
  end_date: string;
  counsellor_input: boolean;
  teachers: Array<{
    id: string;
    displayName: string;
    functions: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    group: string;
    group_name: string;
    last_course_absent: boolean;
    exempted: boolean;
    exemption_attendance: boolean;
    forgotten_notebook: boolean;
    day_history: Array<{
      name: string;
      start_date: string;
      end_date: string;
      type_id: number;
      events: Array<{
        id: number;
        comment: string;
        counsellor_input: boolean;
        end_date: string;
        start_date: string;
        register_id: string;
        type_id: number;
      }>;
    }>;
  }>;
};

const classesCallAdapter: (data: IClassesCallListBackend) => IClassesCall = data => {
  let result = {} as IClassesCall;
  if (!data) return result;
  result = {
    personnel_id: data.personnel_id,
    roof_id: data.roof_id,
    state_id: data.state_id,
    course_id: data.course_id,
    subject_id: data.subject_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    counsellor_input: data.counsellor_input,
    teachers: data.teachers,
    students: data.students,
  };
  return result;
};

export const classesCallService = {
  get: async callId => {
    const data = classesCallAdapter(await fetchJSONWithCache(`/presences/registers/${callId}`));
    return data;
  },
};
