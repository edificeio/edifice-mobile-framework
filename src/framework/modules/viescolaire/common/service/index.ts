import moment from 'moment';

import { ISession, IUser } from '~/framework/modules/auth/model';
import { IClassGroups, ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendClassGroups = {
  id_classe: string;
  id_groups: string[];
  name_classe: string;
  name_groups: string[];
};

type IBackendSchoolYear = {
  start_date: string;
  end_date: string;
};

type IBackendTerm = {
  timestamp_dt: string;
  timestamp_fn: string;
  ordre: number;
  type: number;
  id_type: number;
};

type IBackendUser = {
  aafFunctions: string[];
  allClasses: {
    name: string;
    id: string | number;
  }[];
  attachmentId?: any;
  birthDate: string;
  children: any[];
  code?: any;
  displayName: string;
  externalId: string;
  firstName: string;
  functions: any;
  id: string;
  lastName: string;
  login: string;
  parent1ExternalId: any;
  parent2ExternalId: any;
  parents: any[];
  source: string;
  structures: {
    id: string;
    name: string;
  }[];
  type: string;
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
  } as IClassGroups;
};

const schoolYearAdapter = (data: IBackendSchoolYear): ISchoolYear => {
  return {
    startDate: moment(data.start_date),
    endDate: moment(data.end_date),
  } as ISchoolYear;
};

const termAdapter = (data: IBackendTerm): ITerm => {
  return {
    startDate: moment(data.timestamp_dt),
    endDate: moment(data.timestamp_fn),
    order: data.ordre,
    type: data.type,
    typeId: data.id_type,
  } as ITerm;
};

const userAdapter = (data: IBackendUser): IUser => {
  return {
    id: data.id,
    displayName: data.displayName,
  } as IUser;
};

export const viescoService = {
  classGroups: {
    get: async (session: ISession, classes: string, studentId?: string) => {
      let api = `/viescolaire/group/from/class?classes=${classes}`;
      if (studentId) api += `&student=${studentId}`;
      const classGroups = (await fetchJSONWithCache(api)) as IBackendClassGroupsList;
      return classGroups.map(c => classGroupsAdapter(c)) as IClassGroups[];
    },
  },
  schoolYear: {
    get: async (session: ISession, structureId: string) => {
      const api = `/viescolaire/settings/periode/schoolyear?structureId=${structureId}`;
      const schoolYear = (await fetchJSONWithCache(api)) as IBackendSchoolYear;
      return schoolYearAdapter(schoolYear) as ISchoolYear;
    },
  },
  teachers: {
    get: async (session: ISession, structureId: string) => {
      const api = `/viescolaire/user/list?profile=Teacher&structureId=${structureId}`;
      const teachers = (await fetchJSONWithCache(api)) as IBackendUserList;
      return teachers.map(teacher => userAdapter(teacher)) as IUser[];
    },
  },
  terms: {
    get: async (session: ISession, structureId: string, groupId: string) => {
      const api = `/viescolaire/periodes?idEtablissement=${structureId}&idGroupe=${groupId}`;
      const terms = (await fetchJSONWithCache(api)) as IBackendTermList;
      return terms.map(term => termAdapter(term)) as ITerm[];
    },
  },
};
