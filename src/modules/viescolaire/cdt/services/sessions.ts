import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ISessionList } from '~/modules/viescolaire/cdt/state/sessions';

// Data type of what is given by the backend.
export type ISessionHomeworksBackend = {
  archive_school_year: string;
  audience: {
    externalId: string;
    id: string;
    labels: string[];
    name: string;
  };
  audience_id: string;
  color: string;
  created: string;
  description: string;
  due_date: string; // format 'YYYY-MM-DD'
  estimatedtime: number;
  exceptional_label: string;
  from_session_id: string;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  publish_date: string; // format 'YYYY-MM-DD'
  session_id: string;
  structure_id: string;
  subject: {
    id: string;
    externalId: string;
    name: string;
    rank?: number;
  };
  subject_id: string;
  teacher_id: string;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  type_id: number;
  workload: number;
}[];

export type ISessionListBackend = {
  annotation: string;
  audience_id: string;
  audience: {
    externalId: string;
    id: string;
    labels: string[];
    name: string;
  };
  color: string;
  course_id: string;
  created: string;
  date: string;
  description: string;
  end_time: string;
  exceptional_label: string;
  homeworks: ISessionHomeworksBackend;
  id: string;
  is_empty: boolean;
  is_published: boolean;
  modified: string;
  owner_id: string;
  room: string;
  start_time: string;
  structure_id: string;
  subject_id: string;
  subject: {
    id: string;
    externalId: string;
    name: string;
    rank?: number;
  };
  teacher_id: string;
  title: string;
  type_id: number;
}[];

const sessionListAdapter: (data: ISessionListBackend) => ISessionList = data => {
  let result = [] as ISessionList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    is_published: item.is_published,
    date: moment(item.date),
    subject_id: item.subject_id,
    subject: item.subject,
    exceptional_label: item.exceptional_label,
    start_time: item.start_time,
    end_time: item.end_time,
    teacher_id: item.teacher_id,
    description: item.description,
    title: item.title,
    homeworks: item.homeworks,
    course_id: item.course_id,
    audience: item.audience,
  }));
  return result;
};

export const sessionsService = {
  get: async (structureId: string, startDate: string, endDate: string) => {
    const results = await fetchJSONWithCache(`/diary/sessions/own/${startDate}/${endDate}/${structureId}`);

    const data = sessionListAdapter(results);

    return data;
  },
  getFromChildId: async (childId: string, startDate: string, endDate: string) => {
    const results = await fetchJSONWithCache(`/diary/sessions/child/${startDate}/${endDate}/${childId}`);

    const data = sessionListAdapter(results);

    return data;
  },
};
