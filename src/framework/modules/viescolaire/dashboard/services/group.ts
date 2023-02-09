import querystring from 'querystring';

import { IGroupList } from '~/framework/modules/viescolaire/dashboard/state/group';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// Data type of what is given by the backend.
export type IGroupListBackend = {
  id_classe: string;
  id_groups: string[];
  name_classe: string;
  name_groups: string[];
}[];

const groupListAdapter: (data: IGroupListBackend) => IGroupList = data => {
  let result = [] as IGroupList;
  if (!data) return result;
  result = data.map(item => ({
    idClass: item.id_classe,
    idGroups: item.id_groups,
    nameClass: item.name_classe,
    nameGroups: item.name_groups,
  }));
  return result;
};

export const groupListService = {
  get: async (classes: string, student: string) => {
    return groupListAdapter(
      await fetchJSONWithCache(`/viescolaire/group/from/class?${querystring.stringify({ classes, student })}`),
    );
  },
};
