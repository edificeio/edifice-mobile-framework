import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { classAdapter, courseAdapter, slotAdapter, userChildAdapter } from '~/framework/modules/viescolaire/edt/service/adapters';
import {
  IBackendClassList,
  IBackendCourseList,
  IBackendSlotList,
  IBackendUserChildren,
} from '~/framework/modules/viescolaire/edt/service/types';
import { sessionFetch } from '~/framework/util/transport';

export const edtService = {
  classes: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/classes?idEtablissement=${structureId}&isEdt=true`;
      const classes = await sessionFetch.json<IBackendClassList>(api);
      return classes.map(classAdapter);
    },
  },
  courses: {
    get: async (
      session: AuthActiveAccount,
      structureId: string,
      startDate: Moment,
      endDate: Moment,
      groupIds: string[],
      groupNames: string[],
    ) => {
      const startDateString = startDate.format('YYYY-MM-DD');
      const endDateString = endDate.format('YYYY-MM-DD');
      const api = `/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`;
      const body = JSON.stringify({
        groupExternalIds: [],
        groupIds,
        groupNames,
        teacherIds: [],
        union: true,
      });
      const courses = await sessionFetch.json<IBackendCourseList>(api, { body, method: 'POST' });
      return courses.map(courseAdapter);
    },
    getFromTeacher: async (
      session: AuthActiveAccount,
      structureId: string,
      startDate: Moment,
      endDate: Moment,
      teacherId: string,
    ) => {
      const startDateString = startDate.format('YYYY-MM-DD');
      const endDateString = endDate.format('YYYY-MM-DD');
      const api = `/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`;
      const body = JSON.stringify({
        groupExternalIds: [],
        groupIds: [],
        groupNames: [],
        teacherIds: [teacherId],
        union: true,
      });
      const courses = await sessionFetch.json<IBackendCourseList>(api, { body, method: 'POST' });
      return courses.map(courseAdapter);
    },
  },
  slots: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/edt/time-slots?structureId=${structureId}`;
      const slots = await sessionFetch.json<IBackendSlotList>(api);
      return slots.map(slotAdapter);
    },
  },
  userChildren: {
    get: async (session: AuthActiveAccount) => {
      const api = '/edt/user/children';
      const userChildren = await sessionFetch.json<IBackendUserChildren>(api);
      return userChildren.map(userChildAdapter);
    },
  },
};
