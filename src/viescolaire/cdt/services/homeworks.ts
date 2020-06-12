import { IHomeworkList } from "../state/homeworks";
import moment from "moment";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type IHomeworkListBackend = Array<{
  audience_id: string;
  color: string;
  created: string;
  description: string;
  due_date: string;
  estimatedtime: number;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  progress?: {
    created: string;
    homework_id: number;
    modified: string;
    state_id: number;
    state_label: string;
    user_id: string;
  };
  publish_date: string;
  session_id: string;
  structure_id: string;
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
}>;

const homeworkListAdapter: (data: IHomeworkListBackend) => IHomeworkList = data => {
  let result = [] as IHomeworkList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    due_date: moment(item.due_date),
    type: item.type.label,
    subject_id: item.subject_id,
    progress: item.progress,
  }));
  return result;
};

export const homeworkChildService = {
  get: async(childId: string, structureId: string, startDate: string, endDate: string) => {

    const results = await fetchJSONWithCache(`/diary/homeworks/child/${startDate}/${endDate}/${childId}/${structureId}`);

    const data : IHomeworkList = homeworkListAdapter(results);

    return data;
  }
}

export const homeworkListService = {
  get: async (structureId: string, startDate: string, endDate: string) => {

    const results = await fetchJSONWithCache(`/diary/homeworks/own/${startDate}/${endDate}/${structureId}`);

    const data : IHomeworkList = homeworkListAdapter(results);

    return data;
  },
};