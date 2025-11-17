export type IBackendClassGroups = {
  id_structure: string;
  id_classe: string | null;
  name_classe: string | null;
  name_groups: string[];
  id_groups: string[];
};

export type IBackendSchoolYear = {
  id: number;
  start_date: string;
  end_date: string;
  description: string | null;
  id_structure: string;
  code: string;
  is_opening: boolean;
};

export type IBackendTerm = {
  id: number;
  id_etablissement: string;
  libelle: string | null;
  timestamp_dt: string;
  timestamp_fn: string;
  date_fin_saisie: string;
  id_classe: string;
  id_type: number;
  date_conseil_classe: string;
  publication_bulletin: boolean;
  type: number;
  ordre: number;
};

export type IBackendUser = {
  id: string;
  type: string;
  externalId: string;
  firstName: string;
  lastName: string;
  displayName: string;
};

export type IBackendClassGroupsList = IBackendClassGroups[];
export type IBackendTermList = IBackendTerm[];
export type IBackendUserList = IBackendUser[];
