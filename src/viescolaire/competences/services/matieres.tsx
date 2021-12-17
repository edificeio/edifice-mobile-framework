/* eslint-disable flowtype/no-types-missing-file-annotation */
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IMatiereList } from '~/modules/viescolaire/competences/state/matieres';

export type IMatiereListBackend = {
  id: string;
  externalId: string;
  name: string;
}[];

const matieresAdapter: (data: IMatiereListBackend) => IMatiereList = data => {
  let result = [] as IMatiereList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    externalId: item.externalId,
    name: item.name,
  }));
  return result;
};

export const MatieresService = {
  getMatieres: async (idStudent: string) => {
    return matieresAdapter(await fetchJSONWithCache(`/viescolaire/matieres/eleve/${idStudent}`));
  },
};
