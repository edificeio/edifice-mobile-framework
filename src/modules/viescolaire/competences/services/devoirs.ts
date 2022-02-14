/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from 'moment';
import querystring from 'querystring';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IDevoirsMatieres } from '~/modules/viescolaire/competences/state/devoirs';

export type IDevoirListBackend = {
  teacher: string;
  date: moment.Moment;
  title: string;
  matiere: string;
  diviseur: number;
  coefficient: string;
  note: string;
  moyenne: string;
  competences: {
    nom: string;
    id: number;
    id_devoir: number;
    id_eleve: string;
    id_competence: number;
    evaluation: number;
  }[];
}[];

export type IMatiereListBackend = {
  id: string;
  externalId: string;
  name: string;
}[];

export type IDevoirsMatieresBackend = {
  devoirs: IDevoirListBackend;
  matieres: IMatiereListBackend;
};

const devoirsMatieresAdapter: (data: IDevoirsMatieresBackend) => IDevoirsMatieres = data => {
  let result = {} as IDevoirsMatieres;
  if (!data) return result;
  result = {
    devoirs: data.devoirs.map(item => ({
      teacher: item.teacher,
      date: item.date,
      title: item.title,
      matiere: item.matiere,
      diviseur: item.diviseur,
      coefficient: item.coefficient,
      note: item.note,
      moyenne: item.moyenne,
      competences: item.competences,
    })),
    matieres: data.matieres
      ? data.matieres.map(item => ({
          id: item.id,
          externalId: item.externalId,
          name: item.name,
        }))
      : [],
  };
  return result;
};

export const devoirListService = {
  get: async (idEtablissement: string, idEleve: string, idPeriode?: string, idMatiere?: string) => {
    let urlParameters = '' as string;
    if (idPeriode) urlParameters = `&idPeriode=${idPeriode}`;
    if (idMatiere) urlParameters += `&idMatiere=${idMatiere}`;
    const devoirs = await fetchJSONWithCache(
      `/competences/devoirs/eleve?${querystring.stringify({
        idEtablissement,
        idEleve,
      })}${urlParameters}`,
    );
    return devoirsMatieresAdapter(devoirs);
  },
};
