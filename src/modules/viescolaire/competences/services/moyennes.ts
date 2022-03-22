/* eslint-disable flowtype/no-types-missing-file-annotation */
import querystring from 'querystring';



import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IMoyenneList } from '~/modules/viescolaire/competences/state/moyennes';


export type IMoyenneListBackend = {
  matiere: string;
  matiere_coeff: number;
  matiere_rank: number;
  teacher: string;
  moyenne: string;
  devoirs: {
    note: string;
    diviseur: number;
    name: string;
    coefficient: number;
    is_evaluated: boolean;
    libelle_court: string;
  }[];
};

const moyenneListAdapter: (data: IMoyenneListBackend) => IMoyenneList = data => {
  let result = [] as IMoyenneList;
  if (!data) return result;
  for (const key in data) {
    const item = data[key];
    result.push({
      matiere: item.matiere,
      matiere_coeff: item.matiere_coeff,
      matiere_rank: item.matiere_rank,
      teacher: item.teacher,
      moyenne: item.moyenne,
      devoirs: item.devoirs,
    });
  }
  return result;
};

export const moyenneListService = {
  get: async (idEtablissement: string, idEleve: string, idPeriode?: string) => {
    let urlParameters = '' as string;
    if (idPeriode) urlParameters = `&idPeriode=${idPeriode}`;
    const devoirs = await fetchJSONWithCache(
      `/competences/devoirs/notes?${querystring.stringify({
        idEtablissement,
        idEleve,
      })}${urlParameters}`,
    );
    return moyenneListAdapter(devoirs);
  },
};