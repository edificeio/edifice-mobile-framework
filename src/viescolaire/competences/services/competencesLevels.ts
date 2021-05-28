/* eslint-disable flowtype/no-types-missing-file-annotation */
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { ILevelsList } from "../state/competencesLevels";

export type ILevelsListBackend = {
  couleur: string;
  cycle: string;
  default: string;
  default_lib: string;
  id: number;
  id_cycle: number;
  id_etablissement: string;
  id_niveau: number;
  lettre: string;
  libelle: string;
  ordre: number;
}[];

const levelsAdapter: (data: ILevelsListBackend) => ILevelsList = data => {
  let result = [] as ILevelsList;
  if (!data) return result;
  result = data.map(item => ({
    couleur: item.couleur,
    cycle: item.cycle,
    default: item.default,
    default_lib: item.default_lib,
    id: item.id,
    id_cycle: item.id_cycle,
    id_etablissement: item.id_etablissement,
    id_niveau: item.id_niveau,
    lettre: item.lettre,
    libelle: item.libelle,
    ordre: item.ordre,
  }));
  return result;
};

export const LevelsService = {
  getLevels: async (idStructure: string) => {
    return levelsAdapter(await fetchJSONWithCache(`/competences/maitrise/level/${idStructure}`));
  },
};
