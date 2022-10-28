import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IChildrenGroups } from '~/modules/viescolaire/dashboard/state/childrenGroups';

// Data type of what is given by the backend.
export type IChildrenGroupsBackend = {
  color: string;
  externalId: string;
  id: string;
  name: string;
  notEmptyClass: boolean;
  type_groupe: number;
}[];

const groupListAdapter: (data: IChildrenGroupsBackend) => IChildrenGroups = data => {
  let result = [] as IChildrenGroups;
  if (!data) return result;
  result = data.map(item => ({
    color: item.color,
    externalId: item.externalId,
    id: item.id,
    name: item.name,
    notEmptyClass: item.notEmptyClass,
    type_groupe: item.type_groupe,
  }));
  return result;
};

export const childrenGroupsService = {
  get: async (idStructure: string) => {
    return groupListAdapter(await fetchJSONWithCache(`/viescolaire/classes?idEtablissement=${idStructure}&isEdt=true`));
  },
};
