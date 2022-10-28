import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IDevoirsMatieres, ILevel, IMoyenne, IUserChild } from '~/modules/viescolaire/competences/reducer';

type IBackendDevoir = {
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
};

type IBackendMatiere = {
  id: string;
  externalId: string;
  name: string;
};

type IBackendDevoirsMatieres = {
  devoirs: IBackendDevoir[];
  matieres: IBackendMatiere[];
};

type IBackendLevel = {
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
};

type IBackendMoyenne = {
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

type IBackendUserChild = {
  displayName: string;
  firstName: string;
  id: string;
  idClasse: string;
  idStructure: string;
  lastName: string;
};

type IBackendMoyenneList = { [key: string]: IBackendMoyenne };
type IBackendLevelList = IBackendLevel[];
type IBackendUserChildren = IBackendUserChild[];

const devoirsMatieresAdapter = (data: IBackendDevoirsMatieres): IDevoirsMatieres => {
  return {
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
  } as IDevoirsMatieres;
};

const levelAdapter = (data: IBackendLevel): ILevel => {
  return {
    couleur: data.couleur,
    cycle: data.cycle,
    default: data.default,
    default_lib: data.default_lib,
    id: data.id,
    id_cycle: data.id_cycle,
    id_etablissement: data.id_etablissement,
    id_niveau: data.id_niveau,
    lettre: data.lettre,
    libelle: data.libelle,
    ordre: data.ordre,
  } as ILevel;
};

const moyennesAdapter = (data: IBackendMoyenneList): IMoyenne[] => {
  const moyennes = [] as IMoyenne[];
  for (const key in data) {
    const moyenne = data[key];
    moyennes.push({
      matiere: moyenne.matiere,
      matiere_coeff: moyenne.matiere_coeff,
      matiere_rank: moyenne.matiere_rank,
      teacher: moyenne.teacher,
      moyenne: moyenne.moyenne,
      devoirs: moyenne.devoirs,
    } as IMoyenne);
  }
  return moyennes;
};

const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    idClasse: data.idClasse,
    idStructure: data.idStructure,
    lastName: data.lastName,
  } as IUserChild;
};

export const competencesService = {
  devoirs: {
    get: async (session: IUserSession, idEtablissement: string, idEleve: string, idPeriode?: string, idMatiere?: string) => {
      let api = `/competences/devoirs/eleve?idEtablissement=${idEtablissement}&idEleve=${idEleve}`;
      if (idPeriode) {
        api += `&idPeriode=${idPeriode}`;
      }
      if (idMatiere) {
        api += `&idMatiere=${idMatiere}`;
      }
      const devoirs = (await fetchJSONWithCache(api)) as IBackendDevoirsMatieres;
      return devoirsMatieresAdapter(devoirs);
    },
  },
  levels: {
    get: async (session: IUserSession, idStructure: string) => {
      const api = `/competences/maitrise/level/${idStructure}`;
      const levels = (await fetchJSONWithCache(api)) as IBackendLevelList;
      return levels.map(level => levelAdapter(level)) as ILevel[];
    },
  },
  moyennes: {
    get: async (session: IUserSession, idEtablissement: string, idEleve: string, idPeriode?: string) => {
      let api = `/competences/devoirs/notes?idEtablissement=${idEtablissement}&idEleve=${idEleve}`;
      if (idPeriode) {
        api += `&idPeriode=${idPeriode}`;
      }
      const moyennes = (await fetchJSONWithCache(api)) as IBackendMoyenneList;
      return moyennesAdapter(moyennes) as IMoyenne[];
    },
  },
  userChildren: {
    get: async (session: IUserSession, relativeId: string) => {
      const api = `/competences/enfants?userId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(child => userChildAdapter(child)) as IUserChild[];
    },
  },
};
