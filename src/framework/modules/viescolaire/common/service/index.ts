import moment from 'moment';

import { AccountType, AuthLoggedAccount, IUser } from '~/framework/modules/auth/model';
import { IClassGroups, ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendClassGroups = {
  id_structure: string;
  id_classe: string | null;
  name_classe: string | null;
  name_groups: string[];
  id_groups: string[];
};

type IBackendSchoolYear = {
  id: number;
  start_date: string;
  end_date: string;
  description: string | null;
  id_structure: string;
  code: string;
  is_opening: boolean;
};

type IBackendTerm = {
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

type IBackendUser = {
  id: string;
  type: string;
  externalId: string;
  firstName: string;
  lastName: string;
  displayName: string;
};

type IBackendClassGroupsList = IBackendClassGroups[];
type IBackendTermList = IBackendTerm[];
type IBackendUserList = IBackendUser[];

const classGroupsAdapter = (data: IBackendClassGroups): IClassGroups => {
  return {
    classId: data.id_classe,
    className: data.name_classe,
    groupIds: data.id_groups,
    groupNames: data.name_groups,
  };
};

const schoolYearAdapter = (data: IBackendSchoolYear): ISchoolYear => {
  return {
    endDate: moment(data.end_date),
    id: data.id,
    startDate: moment(data.start_date),
  };
};

const termAdapter = (data: IBackendTerm): ITerm => {
  return {
    endDate: moment(data.timestamp_fn),
    order: data.ordre,
    startDate: moment(data.timestamp_dt),
    type: data.type,
    typeId: data.id_type,
  };
};

const userAdapter = (data: IBackendUser): IUser => {
  return {
    displayName: data.displayName,
    id: data.id,
    login: '',
    type: data.type as AccountType,
  };
};

export const viescoService = {
  classGroups: {
    get: async (session: AuthLoggedAccount, classes: string[], studentId?: string) => {
      let api = `/viescolaire/group/from/class?classes=${classes.join('&classes=')}`;
      if (studentId) api += `&student=${studentId}`;
      const classGroups = (await fetchJSONWithCache(api)) as IBackendClassGroupsList;
      return classGroups.map(classGroupsAdapter);
    },
  },
  schoolYear: {
    get: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/viescolaire/settings/periode/schoolyear?structureId=${structureId}`;
      const schoolYear = (await fetchJSONWithCache(api)) as IBackendSchoolYear;
      return schoolYearAdapter(schoolYear);
    },
  },
  teachers: {
    get: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/viescolaire/user/list?profile=Teacher&structureId=${structureId}`;
      const teachers = (await fetchJSONWithCache(api)) as IBackendUserList;
      return teachers.map(userAdapter);
    },
  },
  terms: {
    get: async (session: AuthLoggedAccount, structureId: string, groupId: string) => {
      const api = `/viescolaire/periodes?idEtablissement=${structureId}&idGroupe=${groupId}`;
      const terms = (await fetchJSONWithCache(api)) as IBackendTermList;
      return terms.map(termAdapter);
    },
  },
};
