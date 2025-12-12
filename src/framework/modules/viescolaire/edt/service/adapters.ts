import moment from 'moment';

import { IBackendClass, IBackendCourse, IBackendSlot, IBackendUserChild } from './types';

import { IClass, IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';

export const classAdapter = (data: IBackendClass): IClass => {
  return {
    color: data.color,
    groupType: data.type_groupe,
    id: data.id,
    name: data.name,
    notEmptyClass: data.notEmptyClass,
  };
};

export const courseAdapter = (data: IBackendCourse): IEdtCourse => {
  return {
    classes: data.classes,
    endDate: moment(data.endDate),
    groups: data.groups,
    id: data._id,
    roomLabels: data.roomLabels ?? [],
    startDate: moment(data.startDate),
    subject: data.subject,
    tags: data.tags,
    teacherIds: data.teacherIds,
  };
};

export const slotAdapter = (data: IBackendSlot): ISlot => {
  return {
    endHour: moment('2000-01-01 ' + data.endHour + ':00'),
    id: data.id,
    name: data.name,
    startHour: moment('2000-01-01 ' + data.startHour + ':00'),
  };
};

export const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    classes: data.classes,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    idClasses: data.idClasses,
    lastName: data.lastName,
  };
};
