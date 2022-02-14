/* eslint-disable flowtype/no-types-missing-file-annotation */
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IServiceList } from '~/modules/viescolaire/competences/state/servicesMatieres';

export type IServiceListBackend = {
  id_matiere: string;
  evaluable: boolean;
  id_groups: string[];
}[];

const servicesAdapter: (data: IServiceListBackend) => IServiceList = data => {
  let result = [] as IServiceList;
  if (!data) return result;
  result = data.map(item => ({
    id_matiere: item.id_matiere,
    evaluable: item.evaluable,
    id_groups: item.id_groups,
  }));
  return result;
};

export const ServicesMatiereListService = {
  getServices: async (idStructure: string) => {
    const result = await fetchJSONWithCache(
      `/viescolaire/services?idEtablissement=${idStructure}&classes=true&groups=true&manualGroups=true&evaluable=true&notEvaluable=false`,
    );
    return servicesAdapter(result);
  },
};
