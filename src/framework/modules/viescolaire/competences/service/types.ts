export type IBackendAnnotation = {
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

export type IBackendAverage = {
  devoirs: IBackendDevoir[];
  id_groupe: string;
  matiere: string;
  matiere_coeff: number;
  matiere_rank: number;
  moyenne: string;
  teacher: string;
};

export type IBackendCompetence = {
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

export type IBackendDevoir = {
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

export type IBackendDomaineCompetence = {
  id: number;
  nom: string;
  id_type: number;
  id_parent: number;
  id_cycle: number;
  id_domaine: number;
  ismanuelle: boolean;
  masque: boolean;
};

export type IBackendDomaine = {
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

export type IBackendLevel = {
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

export type IBackendSubject = {
  idEtablissement: string;
  id: string;
  externalId: string;
  source: string;
  name: string;
  rank: number;
  external_id_subject: string;
  sous_matieres: string[];
};

export type IBackendUserChild = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  idClasse: string;
  idStructure: string;
  id_cycle: number;
};

export type IBackendAnnotationList = IBackendAnnotation[];
export type IBackendAverageList = { [key: string]: IBackendAverage };
export type IBackendCompetenceList = IBackendCompetence[];
export type IBackendDevoirList = IBackendDevoir[];
export type IBackendDomaineList = IBackendDomaine[];
export type IBackendLevelList = IBackendLevel[];
export type IBackendSubjectList = IBackendSubject[];
export type IBackendUserChildren = IBackendUserChild[];
