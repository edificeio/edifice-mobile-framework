import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  classGroupsAdapter,
  schoolYearAdapter,
  termAdapter,
  userAdapter,
} from '~/framework/modules/viescolaire/common/service/adapters';
import {
  IBackendClassGroupsList,
  IBackendSchoolYear,
  IBackendTermList,
  IBackendUserList,
} from '~/framework/modules/viescolaire/common/service/types';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export const viescoService = {
  classGroups: {
    get: async (session: AuthActiveAccount, classes: string[], studentId?: string) => {
      let api = `/viescolaire/group/from/class?classes=${classes.join('&classes=')}`;
      if (studentId) api += `&student=${studentId}`;
      const classGroups = (await fetchJSONWithCache(api)) as IBackendClassGroupsList;
      return classGroups.map(classGroupsAdapter);
    },
  },
  schoolYear: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/settings/periode/schoolyear?structureId=${structureId}`;
      const schoolYear = (await fetchJSONWithCache(api)) as IBackendSchoolYear;
      return schoolYearAdapter(schoolYear);
    },
  },
  teachers: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/user/list?profile=Teacher&structureId=${structureId}`;
      const teachers = (await fetchJSONWithCache(api)) as IBackendUserList;
      return teachers.map(userAdapter);
    },
  },
  terms: {
    get: async (session: AuthActiveAccount, structureId: string, groupId: string) => {
      const api = `/viescolaire/periodes?idEtablissement=${structureId}&idGroupe=${groupId}`;
      const terms = (await fetchJSONWithCache(api)) as IBackendTermList;
      return terms.map(termAdapter);
    },
  },
};
