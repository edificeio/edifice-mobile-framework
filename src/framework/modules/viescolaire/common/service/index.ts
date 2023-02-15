import { ISession, IUser } from '~/framework/modules/auth/model';
import { IClassGroups } from '~/framework/modules/viescolaire/common/model/class-groups';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendClassGroups = {
  id_classe: string;
  id_groups: string[];
  name_classe: string;
  name_groups: string[];
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
type IBackendUserList = IBackendUser[];

const classGroupsAdapter = (data: IBackendClassGroups): IClassGroups => {
  return {
    classId: data.id_classe,
    className: data.name_classe,
    groupIds: data.id_groups,
    groupNames: data.name_groups,
  } as IClassGroups;
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
  teachers: {
    get: async (session: ISession, structureId: string) => {
      const api = `/viescolaire/user/list?profile=Teacher&structureId=${structureId}`;
      const teachers = (await fetchJSONWithCache(api)) as IBackendUserList;
      return teachers.map(teacher => userAdapter(teacher)) as IUser[];
    },
  },
};
