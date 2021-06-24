/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";
import querystring from "querystring";

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IDevoirList } from "../state/devoirs";

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

const devoirListAdapter: (data: IDevoirListBackend) => IDevoirList = data => {
  let result = [] as IDevoirList;
  if (!data) return result;
  result = data.map(item => ({
    teacher: item.teacher,
    date: item.date,
    title: item.title,
    matiere: item.matiere,
    diviseur: item.diviseur,
    coefficient: item.coefficient,
    note: item.note,
    moyenne: item.moyenne,
    competences: item.competences,
  }));
  return result;
};

export const devoirListService = {
  get: async (idEtablissement: string, idEleve: string, idPeriode?: string, idMatiere?: string) => {
    let urlParameters = "" as string;
    if (idPeriode) urlParameters = `&idPeriode=${idPeriode}`;
    if (idMatiere) urlParameters += `&idMatiere=${idMatiere}`;
    const devoirs = await fetchJSONWithCache(
      `/competences/devoirs/eleve?${querystring.stringify({
        idEtablissement,
        idEleve,
      })}${urlParameters}`
    );
    return devoirListAdapter(devoirs);
  },
};
