import { IPersonnelList } from "../state/personnel";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type IPersonnelListBackend = Array<{
  aafFunctions: Array<string>;
  allClasses: Array<{
    name: string;
    id: string | number;
  }>;
  attachmentId?: any;
  birthDate: string;
  children: Array<any>;
  code?: any;
  displayName: string;
  externalId: string;
  firstName: string;
  functions: any;
  id: string;
  lastName: string;
  login: string;
  parent1ExternalId: any;
  parent2ExternalId: any;
  parents: Array<any>;
  source: string;
  structures: Array<{
    id: string;
    name: string;
  }>;
  type: string;
}>;

const personnelListAdapter: (data: IPersonnelListBackend) => IPersonnelList = data => {
  let result = [] as IPersonnelList;
  if (!data) return result;
  result = data.map(item => ({
    displayName: item.displayName,
    firstName: item.firstName,
    id: item.id,
    lastName: item.lastName,
  }));
  return result;
};

export const personnelListService = {
  get: async (structureId: string) => {
    const personnel : Array<any> = await fetchJSONWithCache(`/viescolaire/user/list?profile=Teacher&structureId=${structureId}`);
    const data : IPersonnelList = personnelListAdapter(personnel);

    return data;
  },
};