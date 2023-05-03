import moment from 'moment';

import { ISession } from '~/framework/modules/auth/model';
import { ICompetence, IDevoir, IDomaine, ILevel, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

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
  id: number;
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
  displayName: string;
  firstName: string;
  id: string;
  idClasse: string;
  idStructure: string;
  lastName: string;
};

type IBackendCompetenceList = IBackendCompetence[];
type IBackendDevoirList = IBackendDevoir[];
type IBackendDomaineList = IBackendDomaine[];
type IBackendLevelList = IBackendLevel[];
type IBackendSubjectList = IBackendSubject[];
type IBackendUserChildren = IBackendUserChild[];

const competenceAdapter = (data: IBackendCompetence): ICompetence => {
  return {
    devoirId: data.id_devoir,
    domaineId: data.id_domaine,
    evaluation: data.evaluation,
    id: data.id_competence,
  } as ICompetence;
};

const devoirAdapter = (data: IBackendDevoir): IDevoir => {
  return {
    coefficient: data.coefficient,
    competencesCount: data.nbcompetences,
    date: moment(data.date),
    diviseur: data.diviseur,
    id: data.id,
    isEvaluated: data.is_evaluated,
    libelle: data.libelle ?? undefined,
    moyenne: String(Number(data.sum_notes) / data.nbr_eleves),
    name: data.name,
    note: data.note,
    subjectId: data.id_matiere,
    teacher: data.teacher,
    termId: data.id_periode,
  } as IDevoir;
};

const domaineAdapter = (data: IBackendDomaine): IDomaine => {
  return {
    codification: data.codification,
    degree: data.niveau,
    id: data.id,
    name: data.nom,
    competences: data.competences?.map(c => ({
      id: c.id,
      name: c.nom,
      hidden: c.masque,
    })),
    domaines: data.domaines?.map(domaineAdapter),
  } as IDomaine;
};

const compareDevoirs = (a: IDevoir, b: IDevoir): number => {
  return b.date.diff(a.date);
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

const subjectAdapter = (data: IBackendSubject): ISubject => {
  return {
    id: data.id,
    name: data.name,
    rank: data.rank,
  } as ISubject;
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
  competences: {
    get: async (session: ISession, studentId: string, classId: string) => {
      const api = `/viescolaire/competences/eleve?idEleve=${studentId}&idClasse=${classId}`;
      const competences = (await fetchJSONWithCache(api)) as IBackendCompetenceList;
      return competences.map(competence => competenceAdapter(competence)) as ICompetence[];
    },
  },
  devoirs: {
    get: async (session: ISession, structureId: string, studentId: string) => {
      const api = `/competences/devoirs?idEtablissement=${structureId}&idEleve=${studentId}`;
      const devoirs = (await fetchJSONWithCache(api)) as IBackendDevoirList;
      return devoirs.map(devoir => devoirAdapter(devoir)).sort(compareDevoirs) as IDevoir[];
    },
  },
  domaines: {
    get: async (session: ISession, classId: string) => {
      const api = `/competences/domaines?idClasse=${classId}`;
      const domaines = (await fetchJSONWithCache(api)) as IBackendDomaineList;
      return domaines.map(domaine => domaineAdapter(domaine)) as IDomaine[];
    },
  },
  levels: {
    get: async (session: ISession, structureId: string) => {
      const api = `/competences/maitrise/level/${structureId}`;
      const levels = (await fetchJSONWithCache(api)) as IBackendLevelList;
      return levels.map(level => levelAdapter(level)) as ILevel[];
    },
  },
  subjects: {
    get: async (session: ISession, structureId: string) => {
      const api = `/viescolaire/matieres/services-filter?idEtablissement=${structureId}`;
      const subjects = (await fetchJSONWithCache(api)) as IBackendSubjectList;
      return subjects.map(subject => subjectAdapter(subject)) as ISubject[];
    },
  },
  userChildren: {
    get: async (session: ISession, structureId: string, relativeId: string) => {
      const api = `/competences/enfants?idEtablissement=${structureId}&userId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(child => userChildAdapter(child)) as IUserChild[];
    },
  },
};
