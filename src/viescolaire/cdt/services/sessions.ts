import { ISessionList } from "../state/sessions";
import moment from "moment";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IHomeworkListBackend } from "./homeworks";

// Data type of what is given by the backend.
export type ISessionListBackend = Array<{
  annotation: string;
  audience_id: string;
  color: string;
  course_id: string;
  created: string;
  date: string;
  description: string;
  end_time: string;
  homeworks: IHomeworkListBackend;
  id: number;
  is_empty: boolean;
  is_published: boolean;
  modified: string;
  owner_id: string;
  room: string;
  start_time: string;
  structure_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  type_id: number;
}>;

const sessionListAdapter: (data: ISessionListBackend) => ISessionList = data => {
  let result = [] as  ISessionList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    date: moment(item.date),
    subject_id: item.subject_id,
    start_time: item.start_time,
  }));
  return result;
};

export const sessionChildService = {
  get: async(childId: string, startDate: string, endDate: string) => {

    const results = await fetchJSONWithCache(`/diary/sessions/child/${startDate}/${endDate}/${childId}`);

    const data = sessionListAdapter(results);

    return data;
  }
}

export const sessionListService = {
  get: async (structureId: string, startDate: string, endDate: string) => {

    const results = await fetchJSONWithCache(`/diary/sessions/own/${startDate}/${endDate}/${structureId}`);

    const data = sessionListAdapter(results);

    return data;
  },
};
