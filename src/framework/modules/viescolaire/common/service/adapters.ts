import moment from 'moment';

import { AccountType, IUser } from '~/framework/modules/auth/model';
import { IClassGroups, ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import {
  IBackendClassGroups,
  IBackendSchoolYear,
  IBackendTerm,
  IBackendUser,
} from '~/framework/modules/viescolaire/common/service/types';

export const classGroupsAdapter = (data: IBackendClassGroups): IClassGroups => {
  return {
    classId: data.id_classe,
    className: data.name_classe,
    groupIds: data.id_groups,
    groupNames: data.name_groups,
  };
};

export const schoolYearAdapter = (data: IBackendSchoolYear): ISchoolYear => {
  return {
    endDate: moment(data.end_date),
    id: data.id,
    startDate: moment(data.start_date),
  };
};

export const termAdapter = (data: IBackendTerm): ITerm => {
  return {
    endDate: moment(data.timestamp_fn),
    order: data.ordre,
    startDate: moment(data.timestamp_dt),
    type: data.type,
    typeId: data.id_type,
  };
};

export const userAdapter = (data: IBackendUser): IUser => {
  return {
    displayName: data.displayName,
    id: data.id,
    login: '',
    type: data.type as AccountType,
  };
};
