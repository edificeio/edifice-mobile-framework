import moment from 'moment';

import { ISession } from '~/framework/modules/auth/model';
import { IClass, ICourseTag, IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendClass = {
  color: string;
  externalId: string;
  id: string;
  name: string;
  notEmptyClass: boolean;
  type_groupe: number;
};

type IBackendCourse = {
  _id: string;
  classes: string[];
  groups: string[];
  teacherIds: string[];
  roomLabels: string[];
  startCourse: string;
  endCourse: string;
  exceptionnal: string;
  subjectId: string;
  subject: {
    code: string;
    externalId: string;
    id: string;
    name: string;
    rank: number;
  };
  color: string;
  tags: ICourseTag[];
  tagIds: number[];
};

type IBackendSlot = {
  startHour: string;
  endHour: string;
  name: string;
};

type IBackendUserChild = {
  classes: string[];
  displayName: string;
  firstName: string;
  lastName: string;
  id: string;
  idClasses: string;
};

type IBackendClassList = IBackendClass[];
type IBackendCourseList = IBackendCourse[];
type IBackendSlotList = IBackendSlot[];
type IBackendUserChildren = IBackendUserChild[];

const classAdapter = (data: IBackendClass): IClass => {
  return {
    color: data.color,
    externalId: data.externalId,
    id: data.id,
    name: data.name,
    notEmptyClass: data.notEmptyClass,
    groupType: data.type_groupe,
  } as IClass;
};

const courseAdapter = (data: IBackendCourse): IEdtCourse => {
  return {
    id: data._id,
    teacherIds: data.teacherIds,
    roomLabels: data.roomLabels,
    exceptionnal: data.exceptionnal,
    subjectId: data.subjectId,
    subject: data.subject,
    classes: data.classes,
    groups: data.groups,
    startDate: moment(data.startCourse),
    endDate: moment(data.endCourse),
    color: data.color,
    tags: data.tags,
    tagIds: data.tagIds,
  } as IEdtCourse;
};

const slotAdapter = (data: IBackendSlot): ISlot => {
  return {
    startHour: moment('2000-01-01 ' + data.startHour + ':00'),
    endHour: moment('2000-01-01 ' + data.endHour + ':00'),
    name: data.name,
  } as ISlot;
};

const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    classes: data.classes,
    displayName: data.displayName,
    firstName: data.firstName,
    lastName: data.lastName,
    id: data.id,
    idClasses: data.idClasses,
  } as IUserChild;
};

export const edtService = {
  classes: {
    get: async (session: ISession, structureId: string) => {
      const api = `/viescolaire/classes?idEtablissement=${structureId}&isEdt=true`;
      const classes = (await fetchJSONWithCache(api)) as IBackendClassList;
      return classes.map(c => classAdapter(c)) as IClass[];
    },
  },
  courses: {
    get: async (
      session: ISession,
      structureId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      groups: string[],
      groupIds: string[],
    ) => {
      const startDateString = startDate.format('YYYY-MM-DD');
      const endDateString = endDate.format('YYYY-MM-DD');
      const api = `/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`;
      const body = JSON.stringify({
        teacherIds: [],
        union: true,
        groupExternalIds: [],
        groupIds,
        groupNames: groups,
      });
      const courses = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendCourseList;
      return courses.map(course => courseAdapter(course)) as IEdtCourse[];
    },
    getFromTeacher: async (
      session: ISession,
      structureId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      teacherId: string,
    ) => {
      const startDateString = startDate.format('YYYY-MM-DD');
      const endDateString = endDate.format('YYYY-MM-DD');
      const api = `/edt/structures/${structureId}/common/courses/${startDateString}/${endDateString}`;
      const body = JSON.stringify({
        teacherIds: [teacherId],
        union: true,
        groupExternalIds: [],
        groupIds: [],
        groupNames: [],
      });
      const courses = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendCourseList;
      return courses.map(course => courseAdapter(course)) as IEdtCourse[];
    },
  },
  slots: {
    get: async (session: ISession, structureId: string) => {
      const api = `/edt/time-slots?structureId=${structureId}`;
      const slots = (await fetchJSONWithCache(api)) as IBackendSlotList;
      return slots.map(slot => slotAdapter(slot)) as ISlot[];
    },
  },
  userChildren: {
    get: async (session: ISession) => {
      const api = '/edt/user/children';
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(child => userChildAdapter(child)) as IUserChild[];
    },
  },
};
