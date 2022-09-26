import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IChildArray } from '~/modules/viescolaire/dashboard/state/children';
import { IChildEventsNotification } from '~/modules/viescolaire/presences/state/relativesNotificationModal';

export type IAbsenceReason = {
  absence_compliance: boolean;
  comment: string;
  default: boolean;
  group: boolean;
  hidden: boolean;
  id: number;
  label: string;
  proving: boolean;
  structure_id: string;
};

export type IChildAllEventsNotification = {
  councellor_input: boolean;
  councellor_regularisation: boolean;
  created: moment.Moment;
  id: string;
  end_date: moment.Moment;
  massmailed: boolean;
  owner: string;
  period: string;
  reason?: IAbsenceReason;
  recovery_method: string; // {HALF_DAY / HOUR / DAY}
  register_id: number;
  start_date: moment.Moment;
  student_id: string;
  type_id: number;
};

export type IChildEventsNotificationBackend = {
  students_events: any;
  limit?: number;
  offset?: number;
  recovery_methods: string; // {HALF_DAY / HOUR / DAY}
  totals: {
    JUSTIFIED: number;
    UNJUSTIFIED: number;
    LATENESS: number;
    DEPARTURE: number;
  };
};

const childEventsAdapter: (data: IChildEventsNotificationBackend) => IChildEventsNotification = data => {
  return {
    studentsEvents: data.students_events,
    limit: data.limit,
    offset: data.offset,
    recoveryMethods: data.recovery_methods,
    totals: data.totals,
  };
};

export const relativesNotificationService = {
  fetchChildrenEvents: async (
    childrenArray: IChildArray,
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const childrenIds = [] as string[];
    childrenArray.forEach(child => childrenIds.push(child.id));
    const eventsTypes = ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'] as string[];
    const bodyData = {
      end_at: endDateString,
      start_at: startDateString,
      student_ids: childrenIds,
      types: eventsTypes,
    };
    const result = await fetchJSONWithCache(`/presences/structures/${structureId}/students/events`, {
      method: 'POST',
      body: JSON.stringify(bodyData),
    });
    return childEventsAdapter(result);
  },
};
