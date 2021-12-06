import querystring from 'querystring';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IGroupList } from '~/modules/viescolaire/viesco/state/group';

// Data type of what is given by the backend.
export type IGroupListBackend = Array<{
  id_classe: string;
  id_groups: string[];
  name_classe: string;
  name_groups: string[];
}>;

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
