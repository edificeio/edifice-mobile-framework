import { ISubjectList } from "../state/subjects";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type ISubjectListBackend = Array<{
    subjectCode: string;
    subjectId: string;
    subjectLabel: string;
}>;

const subjectListAdapter: (data: ISubjectListBackend) => ISubjectList = data => {
  let result = [] as ISubjectList;
  if (!data) return result;
  result = data.map(item => ({
    subjectCode: item.subjectCode,
    subjectId: item.subjectId,
    subjectLabel: item.subjectLabel,
  }));
  return result;
};

export const subjectListService = {
  get: async (structureId: string) => {
    const subjects : Array<any> = await fetchJSONWithCache(`/directory/timetable/subjects/${structureId}`);
    const data : ISubjectList = subjectListAdapter(subjects);

    return data;
  },
};