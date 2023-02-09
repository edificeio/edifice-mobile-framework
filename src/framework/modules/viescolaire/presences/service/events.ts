import moment from 'moment';

import { fetchJSONWithCache, fetchWithCache } from '~/infra/fetchWithCache';
import {
  ICallEvent,
  IForgottenNotebooksList,
  IHistoryEvent,
  IHistoryEventsList,
  IIncidentsList,
  IPunishmentsList,
} from '~/modules/viescolaire/presences/state/events';

export type ICallEventBackend = {
  id?: number;
  start_date?: string;
  end_date?: string;
  comment?: string;
  counsellor_input?: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id?: number;
};

export type IHistoryEventBackend = {
  start_date: string;
  end_date: string;
  type_id: number;
  recovery_method: string;
  period: string;
};

export type IHistoryEventsListBackend = {
  all: {
    DEPARTURE: IHistoryEventBackend[];
    NO_REASON: IHistoryEventBackend[];
    REGULARIZED: IHistoryEventBackend[];
    LATENESS: IHistoryEventBackend[];
    UNREGULARIZED: IHistoryEventBackend[];
  };
};

export type IForgottenNotebooksBackend = {
  all: {
    date: string;
  }[];
};

export type IIncidentBackend = {
  all: {
    INCIDENT: {
      date: string;
      protagonist: {
        label: string;
      };
      type: {
        label: string;
      };
    }[];
    PUNISHMENT: {
      created_at: string;
      fields: {
        start_at: string;
        end_at: string;
        delay_at: string;
      };
      type: {
        label: string;
        punishment_category_id: number;
      };
    }[];
  };
};

const callEventAdapter: (data: ICallEventBackend) => ICallEvent = data => {
  return {
    id: data.id,
    start_date: data.start_date,
    end_date: data.end_date,
    comment: data.comment,
    counsellor_input: data.counsellor_input,
    student_id: data.student_id,
    register_id: data.register_id,
    type_id: data.type_id,
    reason_id: data.reason_id,
  };
};

const historyEventAdapter: (event: IHistoryEventBackend) => IHistoryEvent = event => {
  return {
    start_date: moment(event.start_date),
    end_date: moment(event.end_date),
    type_id: event.type_id,
    recovery_method: event.recovery_method,
    period: event.period,
  };
};

const allEventsAdapter: (data: IHistoryEventsListBackend) => {
  lateness: IHistoryEventsList;
  departure: IHistoryEventsList;
  regularized: IHistoryEventsList;
  unregularized: IHistoryEventsList;
  no_reason: IHistoryEventsList;
} = data => {
  return {
    lateness: data.all.LATENESS.map(e => historyEventAdapter(e)),
    departure: data.all.DEPARTURE.map(e => historyEventAdapter(e)),
    regularized: data.all.REGULARIZED.map(e => historyEventAdapter(e)),
    unregularized: data.all.UNREGULARIZED.map(e => historyEventAdapter(e)),
    no_reason: data.all.NO_REASON.map(e => historyEventAdapter(e)),
  };
};

const forgottenNotebooksAdapter: (data: IForgottenNotebooksBackend) => IForgottenNotebooksList = data => {
  return data.all.map(e => ({
    date: moment(e.date),
  }));
};

const incidentsAdapter: (data: IIncidentBackend) => { incidents: IIncidentsList; punishments: IPunishmentsList } = data => {
  return {
    incidents: data.all.INCIDENT.map(i => ({ date: moment(i.date), protagonist: i.protagonist, label: i.type.label })),
    punishments: data.all.PUNISHMENT.map(p => ({
      created_at: moment(p.created_at),
      start_date: moment(p.fields.start_at),
      end_date: moment(p.fields.end_at),
      delay_at: moment(p.fields.delay_at),
      label: p.type.label,
      punishment_category_id: p.type.punishment_category_id,
    })),
  };
};

export const eventsService = {
  postLate: async (studentId: string, date: moment.Moment, comment: string, registerId: number, courseStart: moment.Moment) => {
    const stringDate = date.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseStart = courseStart.format('YYYY-MM-DD HH:mm:ss');
    const result: ICallEventBackend = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 2,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: 'post',
    });
    return callEventAdapter(result);
  },
  putLate: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseStart: moment.Moment,
  ) => {
    const stringDate = date.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseStart = courseStart.format('YYYY-MM-DD HH:mm:ss');
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 2,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: 'put',
    });
    return callEventAdapter(result);
  },
  postLeaving: async (studentId: string, date: moment.Moment, comment: string, registerId: number, courseEnd: moment.Moment) => {
    const stringDate = date.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseEnd = courseEnd.format('YYYY-MM-DD HH:mm:ss');
    const result = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 3,
        start_date: stringDate,
        end_date: stringCourseEnd,
        comment,
      }),
      method: 'post',
    });
    return callEventAdapter(result);
  },
  putLeaving: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseEnd: moment.Moment,
  ) => {
    const stringDate = date.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseEnd = courseEnd.format('YYYY-MM-DD HH:mm:ss');
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 3,
        start_date: stringDate,
        end_date: stringCourseEnd,
        comment,
      }),
      method: 'put',
    });
    return callEventAdapter(result);
  },
  postAbsent: async (studentId: string, registerId: number, courseStart: moment.Moment, courseEnd: moment.Moment) => {
    const stringCourseEnd = courseEnd.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseStart = courseStart.format('YYYY-MM-DD HH:mm:ss');
    const result: ICallEventBackend = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 1,
        start_date: stringCourseStart,
        end_date: stringCourseEnd,
      }),
      method: 'post',
    });
    return callEventAdapter(result);
  },
  putAbsent: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseStart: moment.Moment,
  ) => {
    const stringDate = date.format('YYYY-MM-DD HH:mm:ss');
    const stringCourseStart = courseStart.format('YYYY-MM-DD HH:mm:ss');
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 1,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: 'put',
    });
    return callEventAdapter(result);
  },
  deleteEvent: async (eventId: number) => {
    await fetchJSONWithCache(`/presences/events/${eventId}`, {
      method: 'delete',
    });
  },
  updateRegisterStatus: async (registerId: number, status: number) => {
    await fetchWithCache(`/presences/registers/${registerId}/status`, {
      body: JSON.stringify({
        state_id: status,
      }),
      method: 'put',
    });
  },
  fetchStudentEvents: async (studentId: string, structureId: string, startDate: moment.Moment, endDate: moment.Moment) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const result = await fetchJSONWithCache(
      `/presences/students/${studentId}/events?structure_id=${structureId}&start_at=${startDateString}&end_at=${endDateString}&type=NO_REASON&type=UNREGULARIZED&type=REGULARIZED&type=LATENESS&type=DEPARTURE`,
    );
    return allEventsAdapter(result);
  },
  fetchStudentForgottenNotebook: async (
    studentId: string,
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
  ) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    const result = await fetchJSONWithCache(
      `/presences/forgotten/notebook/student/${studentId}?structure_id=${structureId}&start_at=${startDateString}&end_at=${endDateString}`,
    );
    return forgottenNotebooksAdapter(result);
  },
  fetchStudentIncidents: async (studentId: string, structureId: string, startDate: moment.Moment, endDate: moment.Moment) => {
    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');
    try {
      const result = await fetchJSONWithCache(
        `/incidents/students/${studentId}/events?structure_id=${structureId}&start_at=${startDateString}&end_at=${endDateString}&type=INCIDENT&type=PUNISHMENT`,
      );
      return incidentsAdapter(result);
    } catch (e) {
      return [];
    }
  },
};
