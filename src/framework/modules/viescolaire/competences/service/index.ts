import moment from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import {
  IAverage,
  ICompetence,
  IDevoir,
  IDomaine,
  ILevel,
  ISubject,
  IUserChild,
} from '~/framework/modules/viescolaire/competences/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendAnnotation = {
  id_devoir: number;
  id: number;
  libelle: string;
  libelle_court: string;
  id_etablissement: string;
  id_eleve: string;
  owner: string;
  id_matiere: string;
  id_sousmatiere: number | null;
  name: string;
  is_evaluated: boolean;
  id_periode: number;
  id_type: number;
  diviseur: string;
  date_publication: string;
  date: string;
  apprec_visible: boolean;
  coefficient: string;
  _type_libelle: string;
  formative: boolean;
  sum_notes: string;
  nbr_eleves: number;
  id_groupe: string;
};

type IBackendAverage = {
  devoirs: IBackendDevoir[];
  id_groupe: string;
  matiere: string;
  matiere_coeff: number;
  matiere_rank: number;
  moyenne: string;
  teacher: string;
};

type IBackendCompetence = {
  id_devoir: number;
  id_competence: number;
  id_domaine: number;
  id_competences_notes: number;
  evaluation: number;
  owner: string;
  id_eleve: string;
  created: string;
  modified: string;
  id_matiere: string;
  id_sousmatiere: string | null;
  name: string;
  is_evaluated: boolean;
  id_periode: number;
  id_type: number;
  diviseur: string;
  date_publication: string;
  date: string;
  apprec_visible: boolean;
  coefficient: string;
  libelle: string | null;
  _type_libelle: string;
  owner_name: string;
  id_groupe: string;
};

type IBackendDevoir = {
  id: number;
  name: string;
  owner: string;
  created: string;
  modified: string;
  coefficient: string;
  libelle: string | null;
  id_sousmatiere: string | null;
  id_periode: number;
  id_type: number;
  id_etablissement: string;
  diviseur: number;
  id_matiere: string;
  ramener_sur: boolean;
  date_publication: string;
  date: string;
  is_evaluated: boolean;
  id_etat: number;
  percent: number;
  apprec_visible: boolean;
  eval_lib_historise: boolean;
  _type_libelle: string;
  _periode_type: number;
  _periode_ordre: number;
  teacher: string;
  id_groupe: string;
  note: string;
  nbcompetences: number;
  sum_notes: string;
  nbr_eleves: number;
};

type IBackendDomaineCompetence = {
  id: number;
  nom: string;
  id_type: number;
  id_parent: number;
  id_cycle: number;
  id_domaine: number;
  ismanuelle: boolean;
  masque: boolean;
};

type IBackendDomaine = {
  niveau: number;
  id: number;
  id_parent: number;
  libelle: string;
  codification: string;
  evaluated: boolean;
  id_cycle: number;
  dispensable: boolean;
  nom: string;
  nomhtml: string;
  competences?: IBackendDomaineCompetence[];
  domaines?: IBackendDomaine[];
};

type IBackendLevel = {
  libelle: string;
  default_lib: string;
  ordre: number;
  default: string;
  id_cycle: number;
  id_niveau: number;
  id_etablissement: string;
  couleur: string;
  lettre: string;
  id: number | null;
  cycle: string;
};

type IBackendSubject = {
  idEtablissement: string;
  id: string;
  externalId: string;
  source: string;
  name: string;
  rank: number;
  external_id_subject: string;
  sous_matieres: string[];
};

type IBackendUserChild = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  idClasse: string;
  idStructure: string;
  id_cycle: number;
};

type IBackendAnnotationList = IBackendAnnotation[];
type IBackendAverageList = { [key: string]: IBackendAverage };
type IBackendCompetenceList = IBackendCompetence[];
type IBackendDevoirList = IBackendDevoir[];
type IBackendDomaineList = IBackendDomaine[];
type IBackendLevelList = IBackendLevel[];
type IBackendSubjectList = IBackendSubject[];
type IBackendUserChildren = IBackendUserChild[];

const annotationAdapter = (data: IBackendAnnotation): IDevoir => {
  return {
    coefficient: data.coefficient,
    date: moment(data.date),
    diviseur: Number(data.diviseur),
    id: data.id_devoir,
    isEvaluated: data.is_evaluated,
    libelle: data.libelle ?? undefined,
    moyenne: String(Number((Number(data.sum_notes) / data.nbr_eleves).toFixed(1))),
    name: data.name,
    note: data.libelle_court,
    subjectId: data.id_matiere,
    termId: data.id_periode,
  };
};

const averageAdapter = (list: IBackendAverageList): IAverage[] => {
  return Object.entries(list).map(([subjectId, data]) => {
    return {
      average: data.moyenne,
      subject: data.matiere,
      subjectCoefficient: data.matiere_coeff,
      subjectId,
      subjectRank: data.matiere_rank,
      teacher: data.teacher,
    };
  });
};

const competenceAdapter = (data: IBackendCompetence): ICompetence => {
  return {
    date: moment(data.date),
    devoirId: data.id_devoir,
    domaineId: data.id_domaine,
    evaluation: data.evaluation,
    id: data.id_competence,
    ownerName: data.owner_name,
    subjectId: data.id_matiere,
  };
};

const devoirAdapter = (data: IBackendDevoir): IDevoir => {
  return {
    coefficient: data.coefficient,
    date: moment(data.date),
    diviseur: data.diviseur,
    id: data.id,
    isEvaluated: data.is_evaluated,
    libelle: data.libelle ?? undefined,
    moyenne: String(Number((Number(data.sum_notes) / data.nbr_eleves).toFixed(1))),
    name: data.name,
    note: data.note,
    subjectId: data.id_matiere,
    teacher: data.teacher,
    termId: data.id_periode,
  };
};

const compareDevoirs = (a: IDevoir, b: IDevoir): number => {
  return b.date.diff(a.date);
};

// Append assessments with no grade to given assessment array
export const concatDevoirs = (devoirs: IDevoir[], competences: ICompetence[]): IDevoir[] => {
  return devoirs
    .concat(
      competences
        .filter(c => !devoirs.map(d => d.id).includes(c.devoirId))
        .map(
          c =>
            ({
              date: c.date,
              id: c.devoirId,
              subjectId: c.subjectId,
              teacher: c.ownerName,
            }) as IDevoir,
        )
        .filter((devoir, index, array) => array.findIndex(d => d.id === devoir.id) === index),
    )
    .sort(compareDevoirs);
};

const domaineAdapter = (data: IBackendDomaine): IDomaine => {
  return {
    codification: data.codification,
    cycleId: data.id_cycle,
    degree: data.niveau,
    id: data.id,
    name: data.nom,
    competences: data.competences?.map(c => ({
      id: c.id,
      name: c.nom,
      hidden: c.masque,
    })),
    domaines: data.domaines?.map(domaineAdapter),
  };
};

const levelAdapter = (data: IBackendLevel): ILevel => {
  return {
    color: data.couleur,
    cycleId: data.id_cycle,
    defaultColor: data.default,
    id: data.id ?? data.id_niveau,
    label: data.libelle,
    order: data.ordre,
  };
};

const subjectAdapter = (data: IBackendSubject): ISubject => {
  return {
    id: data.id,
    name: data.name,
    rank: data.rank,
  };
};

const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    classId: data.idClasse,
    cycleId: data.id_cycle,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structureId: data.idStructure,
  };
};

export const competencesService = {
  annotations: {
    get: async (session: AuthLoggedAccount, studentId: string, classId: string) => {
      const api = `/viescolaire/annotations/eleve?idEleve=${studentId}&idClasse=${classId}`;
      const annotations = (await fetchJSONWithCache(api)) as IBackendAnnotationList;
      return annotations.map(annotationAdapter);
    },
  },
  averages: {
    get: async (session: AuthLoggedAccount, structureId: string, studentId: string, termId?: string) => {
      let api = `/competences/devoirs/notes?idEtablissement=${structureId}&idEleve=${studentId}`;
      if (termId) {
        api += `&idPeriode=${termId}`;
      }
      const averages = (await fetchJSONWithCache(api)) as IBackendAverageList;
      return averageAdapter(averages);
    },
  },
  competences: {
    get: async (session: AuthLoggedAccount, studentId: string, classId: string) => {
      const api = `/viescolaire/competences/eleve?idEleve=${studentId}&idClasse=${classId}`;
      const competences = (await fetchJSONWithCache(api)) as IBackendCompetenceList;
      return competences.map(competenceAdapter);
    },
  },
  devoirs: {
    get: async (session: AuthLoggedAccount, structureId: string, studentId: string) => {
      const api = `/competences/devoirs?idEtablissement=${structureId}&idEleve=${studentId}`;
      const devoirs = (await fetchJSONWithCache(api)) as IBackendDevoirList;
      return devoirs.map(devoirAdapter);
    },
  },
  domaines: {
    get: async (session: AuthLoggedAccount, classId: string) => {
      const api = `/competences/domaines?idClasse=${classId}`;
      const domaines = (await fetchJSONWithCache(api)) as IBackendDomaineList;
      return domaines.map(domaineAdapter);
    },
  },
  levels: {
    get: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/competences/maitrise/level/${structureId}`;
      const levels = (await fetchJSONWithCache(api)) as IBackendLevelList;
      return levels.map(levelAdapter);
    },
  },
  subjects: {
    get: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/viescolaire/matieres/services-filter?idEtablissement=${structureId}`;
      const subjects = (await fetchJSONWithCache(api)) as IBackendSubjectList;
      return subjects.map(subjectAdapter);
    },
  },
  userChildren: {
    get: async (session: AuthLoggedAccount, structureId: string, relativeId: string) => {
      const api = `/competences/enfants?idEtablissement=${structureId}&userId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(userChildAdapter);
    },
  },
};
