import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IPersonnelList } from '~/modules/viescolaire/dashboard/state/personnel';

// Data type of what is given by the backend.
export type IPersonnelListBackend = {
  aafFunctions: string[];
  allClasses: {
    name: string;
    id: string | number;
  }[];
  attachmentId?: any;
  birthDate: string;
  children: any[];
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
  parents: any[];
  source: string;
  structures: {
    id: string;
    name: string;
  }[];
  type: string;
}[];

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
    const personnel: any[] = await fetchJSONWithCache(`/viescolaire/user/list?profile=Teacher&structureId=${structureId}`);
    const data: IPersonnelList = personnelListAdapter(personnel);

    return data;
  },
};
