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
import { sessionFetch } from '~/framework/util/transport';

export const viescoService = {
  classGroups: {
    get: async (session: AuthActiveAccount, classes: string[], studentId?: string) => {
      let api = `/viescolaire/group/from/class?classes=${classes.join('&classes=')}`;
      if (studentId) api += `&student=${studentId}`;
      const classGroups = await sessionFetch.json<IBackendClassGroupsList>(api);
      return classGroups.map(classGroupsAdapter);
    },
  },
  schoolYear: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/settings/periode/schoolyear?structureId=${structureId}`;
      const schoolYear = await sessionFetch.json<IBackendSchoolYear>(api);
      return schoolYearAdapter(schoolYear);
    },
  },
  teachers: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/user/list?profile=Teacher&structureId=${structureId}`;
      const teachers = await sessionFetch.json<IBackendUserList>(api);
      return teachers.map(userAdapter);
    },
  },
  terms: {
    get: async (session: AuthActiveAccount, structureId: string, groupId: string) => {
      const api = `/viescolaire/periodes?idEtablissement=${structureId}&idGroupe=${groupId}`;
      const terms = await sessionFetch.json<IBackendTermList>(api);
      return terms.map(termAdapter);
    },
  },
};
