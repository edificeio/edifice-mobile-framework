import moment from 'moment';
import querystring from 'querystring';

import { ISession } from '~/framework/modules/auth/model';
import {
  EventType,
  ICallEvent,
  IChildrenEvents,
  IClassCall,
  ICourse,
  ICourseRegister,
  IEventReason,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IMemento,
  IPunishment,
  IRelative,
  IStudentsEvents,
  IUserChild,
} from '~/framework/modules/viescolaire/presences/model';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache, fetchWithCache } from '~/infra/fetchWithCache';

type IBackendChildrenEvents = {
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

type IBackendClassCall = {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: string;
  end_date: string;
  counsellor_input: boolean;
  teachers: {
    id: string;
    displayName: string;
    functions: string;
  }[];
  students: {
    id: string;
    name: string;
    group: string;
    group_name: string;
    last_course_absent: boolean;
    exempted: boolean;
    exemption_attendance: boolean;
    forgotten_notebook: boolean;
    day_history: {
      name: string;
      start_date: string;
      end_date: string;
      type_id: number;
      events: {
        id: number;
        comment: string;
        counsellor_input: boolean;
        end_date: string;
        start_date: string;
        register_id: string;
        type_id: number;
        reason_id: number | null;
      }[];
    }[];
  }[];
};

type IBackendCourse = {
  id: string;
  allowRegister: boolean;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: string;
  endDate: string;
  roomLabels: string[];
  groups: string[];
  registerId: string;
  splitSlot: boolean;
};

type IBackendCourseRegister = {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: string;
  end_date: string;
  councellor_input: boolean;
};

type IBackendEvent = {
  id: number;
  start_date: string;
  end_date: string;
  comment: string;
  counsellor_input: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id: number;
};

type IBackendEventReason = {
  id: number;
  structure_id: string;
  label: string;
  proving: boolean;
  comment: string;
  default: boolean;
  group: boolean;
  hidden: boolean;
  absence_compliance: boolean;
  created: string;
  reason_type_id: number;
  reason_alert_rules: string[];
  used: boolean;
};

type IBackendHistoryEvent = {
  start_date: string;
  end_date: string;
  type_id: number;
  recovery_method: string;
  period: string;
};

type IBackendHistoryEvents = {
  all: {
    DEPARTURE: IBackendHistoryEventList;
    NO_REASON: IBackendHistoryEventList;
    REGULARIZED: IBackendHistoryEventList;
    LATENESS: IBackendHistoryEventList;
    UNREGULARIZED: IBackendHistoryEventList;
  };
};

type IBackendHistoryForgottenNotebooks = {
  all: {
    date: string;
  }[];
};

type IBackendHistoryIncidents = {
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

type IBackendMemento = {
  id: string;
  name: string;
  birth_date: string;
  classes: string[];
  groups: string[];
  comment: string;
  accommodation: string;
  relatives: IRelative[];
};

type IBackendStudentsEvents = {
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

type IBackendUserChild = {
  birth: string;
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  structures: {
    classes: {
      id: string;
      name: string;
      structure: string;
    }[];
    id: string;
    name: string;
  }[];
};

type IBackendCourseList = IBackendCourse[];
type IBackendEventReasonList = IBackendEventReason[];
type IBackendHistoryEventList = IBackendHistoryEvent[];
type IBackendUserChildren = IBackendUserChild[];

const childrenEventsAdapter = (data: IBackendChildrenEvents): IChildrenEvents => {
  return {
    studentsEvents: data.students_events,
    limit: data.limit,
    offset: data.offset,
    recoveryMethods: data.recovery_methods,
    totals: data.totals,
  } as IChildrenEvents;
};

const classCallAdapter = (data: IBackendClassCall): IClassCall => {
  return {
    personnel_id: data.personnel_id,
    roof_id: data.roof_id,
    state_id: data.state_id,
    course_id: data.course_id,
    subject_id: data.subject_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    counsellor_input: data.counsellor_input,
    teachers: data.teachers,
    students: data.students,
  } as IClassCall;
};

const courseAdapter = (data: IBackendCourse): ICourse => {
  return {
    id: data.id,
    allowRegister: data.allowRegister,
    subjectId: data.subjectId,
    classes: data.classes,
    structureId: data.structureId,
    startDate: moment(data.startDate),
    endDate: moment(data.endDate),
    roomLabels: data.roomLabels,
    groups: data.groups,
    registerId: data.registerId,
    splitSlot: data.splitSlot,
  } as ICourse;
};

const courseRegisterAdapter = (data: IBackendCourseRegister): ICourseRegister => {
  return {
    id: data.id,
    course_id: data.course_id,
    structure_id: data.structure_id,
    state_id: data.state_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    councellor_input: data.councellor_input,
  } as ICourseRegister;
};

const eventAdapter = (data: IBackendEvent): ICallEvent => {
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
  } as ICallEvent;
};

const eventReasonAdapter = (data: IBackendEventReason): IEventReason => {
  return {
    id: data.id,
    label: data.label,
    reasonTypeId: data.reason_type_id,
  } as IEventReason;
};

const historyEventAdapter = (data: IBackendHistoryEvent): IHistoryEvent => {
  return {
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    type_id: data.type_id,
    recovery_method: data.recovery_method,
    period: data.period,
  } as IHistoryEvent;
};

const historyEventsAdapter = (data: IBackendHistoryEvents) => {
  return {
    latenesses: data.all.LATENESS.map(e => historyEventAdapter(e)),
    departures: data.all.DEPARTURE.map(e => historyEventAdapter(e)),
    regularized: data.all.REGULARIZED.map(e => historyEventAdapter(e)),
    unregularized: data.all.UNREGULARIZED.map(e => historyEventAdapter(e)),
    noReason: data.all.NO_REASON.map(e => historyEventAdapter(e)),
  };
};

const historyForgottenNotebooksAdapter = (data: IBackendHistoryForgottenNotebooks): IForgottenNotebook[] => {
  return data.all.map(event => ({
    date: moment(event.date),
  })) as IForgottenNotebook[];
};

const historyIncidentsAdapter = (data: IBackendHistoryIncidents): { incidents: IIncident[]; punishments: IPunishment[] } => {
  return {
    incidents: data.all.INCIDENT.map(i => ({
      date: moment(i.date),
      protagonist: i.protagonist,
      label: i.type.label,
    })) as IIncident[],
    punishments: data.all.PUNISHMENT.map(p => ({
      created_at: moment(p.created_at),
      start_date: moment(p.fields.start_at),
      end_date: moment(p.fields.end_at),
      delay_at: moment(p.fields.delay_at),
      label: p.type.label,
      punishment_category_id: p.type.punishment_category_id,
    })) as IPunishment[],
  };
};

const mementoAdapter = (data: IBackendMemento): IMemento => {
  return {
    id: data.id,
    name: data.name,
    birth_date: data.birth_date,
    classes: data.classes,
    groups: data.groups,
    comment: data.comment,
    relatives: data.relatives,
    accommodation: data.accommodation,
  } as IMemento;
};

const studentsEventsAdapter = (data: IBackendStudentsEvents): IStudentsEvents => {
  return {
    studentsEvents: data.students_events,
    limit: data.limit,
    offset: data.offset,
    recoveryMethods: data.recovery_methods,
    totals: data.totals,
  } as IStudentsEvents;
};

const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    birth: data.birth,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structures: data.structures,
  } as IUserChild;
};

export const presencesService = {
  absence: {
    create: async (
      session: ISession,
      structureId: string,
      studentId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      description: string,
    ) => {
      const api = '/presences/statements/absences';
      const formData = new FormData();
      formData.append('structure_id', structureId);
      formData.append('student_id', studentId);
      formData.append('start_at', startDate.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('end_at', endDate.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('description', description);
      await fetchJSONWithCache(api, {
        method: 'POST',
        body: formData,
      });
    },
    createWithFile: async (
      session: ISession,
      structureId: string,
      studentId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      description: string,
      file: LocalFile,
    ) => {
      const api = '/presences/statements/absences/attachment';
      const fields = {
        structure_id: structureId,
        student_id: studentId,
        start_at: startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_at: endDate.format('YYYY-MM-DD HH:mm:ss'),
        description,
      };
      await fileTransferService.uploadFile(
        session,
        file,
        {
          url: api,
          fields,
        },
        res => {
          return res.id;
        },
      );
    },
  },
  childrenEvents: {
    get: async (session: ISession, structureId: string, studentIds: string[]) => {
      const api = `/presences/structures/${structureId}/students/events`;
      const body = JSON.stringify({
        student_ids: studentIds,
        types: ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'],
        start_at: moment().format('YYYY-MM-DD'),
        end_at: moment().format('YYYY-MM-DD'),
      });
      const childrenEvents = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendChildrenEvents;
      return childrenEventsAdapter(childrenEvents) as IChildrenEvents;
    },
  },
  classCall: {
    get: async (session: ISession, id: string) => {
      const api = `/presences/registers/${id}`;
      const classCall = (await fetchJSONWithCache(api)) as IBackendClassCall;
      return classCallAdapter(classCall);
    },
    updateStatus: async (session: ISession, id: string, status: number) => {
      const api = `/presences/registers/${id}/status`;
      const body = JSON.stringify({
        state_id: status,
      });
      await fetchWithCache(api, {
        method: 'PUT',
        body,
      });
    },
  },
  courses: {
    get: async (
      session: ISession,
      teacherId: string,
      structureId: string,
      startDate: string,
      endDate: string,
      allowMultipleSlots?: boolean,
    ) => {
      const api = `/presences/courses?${querystring.stringify({
        teacher: teacherId,
        structure: structureId,
        start: startDate,
        end: endDate,
        forgotten_registers: false,
        multiple_slot: allowMultipleSlots,
      })}`;
      const courses = (await fetchJSONWithCache(api)) as IBackendCourseList;
      return courses.map(course => courseAdapter(course)).sort((a, b) => a.startDate.diff(b.startDate)) as ICourse[];
    },
  },
  courseRegister: {
    create: async (session: ISession, course: ICourse, teacherId: string, allowMultipleSlots?: boolean) => {
      const api = '/presences/registers';
      const body = JSON.stringify({
        course_id: course.id,
        structure_id: course.structureId,
        start_date: course.startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_date: course.endDate.format('YYYY-MM-DD HH:mm:ss'),
        subject_id: course.subjectId,
        groups: course.groups,
        classes: course.classes ?? course.groups,
        teacherIds: [teacherId],
        split_slot: allowMultipleSlots,
      });
      const courseRegister = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendCourseRegister;
      return courseRegisterAdapter(courseRegister);
    },
  },
  event: {
    create: async (
      session: ISession,
      studentId: string,
      callId: string,
      type: EventType,
      startDate: moment.Moment,
      endDate: moment.Moment,
      reasonId: number | null,
      comment?: string,
    ) => {
      const api = '/presences/events';
      const body = JSON.stringify({
        student_id: studentId,
        register_id: callId,
        type_id: type as number,
        start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_date: endDate.format('YYYY-MM-DD HH:mm:ss'),
        reason_id: reasonId,
        comment,
      });
      const event = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendEvent;
      return eventAdapter(event);
    },
    delete: async (session: ISession, id: number) => {
      const api = `/presences/events/${id}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
    update: async (
      session: ISession,
      id: number,
      studentId: string,
      callId: string,
      type: EventType,
      startDate: moment.Moment,
      endDate: moment.Moment,
      reasonId: number | null,
      comment?: string,
    ) => {
      const api = `/presences/events/${id}`;
      const body = JSON.stringify({
        student_id: studentId,
        register_id: callId,
        type_id: type as number,
        start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_date: endDate.format('YYYY-MM-DD HH:mm:ss'),
        reason_id: reasonId,
        comment,
      });
      const event = (await fetchJSONWithCache(api, {
        method: 'PUT',
        body,
      })) as IBackendEvent;
      return eventAdapter(event);
    },
  },
  eventReasons: {
    get: async (session: ISession, structureId: string) => {
      const api = `/presences/reasons?structureId=${structureId}&reasonTypeId=0`;
      const eventReasons = (await fetchJSONWithCache(api)) as IBackendEventReasonList;
      return eventReasons.map(eventReason => eventReasonAdapter(eventReason)) as IEventReason[];
    },
  },
  history: {
    getEvents: async (session: ISession, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/presences/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=NO_REASON&type=UNREGULARIZED&type=REGULARIZED&type=LATENESS&type=DEPARTURE`;
      const events = (await fetchJSONWithCache(api)) as IBackendHistoryEvents;
      return historyEventsAdapter(events);
    },
    getForgottenNotebookEvents: async (
      session: ISession,
      studentId: string,
      structureId: string,
      startDate: string,
      endDate: string,
    ) => {
      const api = `/presences/forgotten/notebook/student/${studentId}?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}`;
      const forgottenNotebooks = (await fetchJSONWithCache(api)) as IBackendHistoryForgottenNotebooks;
      return historyForgottenNotebooksAdapter(forgottenNotebooks) as IForgottenNotebook[];
    },
    getIncidents: async (session: ISession, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/incidents/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=INCIDENT&type=PUNISHMENT`;
      const incidents = (await fetchJSONWithCache(api)) as IBackendHistoryIncidents;
      return historyIncidentsAdapter(incidents) as { incidents: IIncident[]; punishments: IPunishment[] };
    },
  },
  memento: {
    get: async (session: ISession, studentId: string) => {
      const api = `/viescolaire/memento/students/${studentId}`;
      const memento = (await fetchJSONWithCache(api)) as IBackendMemento;
      return mementoAdapter(memento);
    },
  },
  preferences: {
    getRegister: async (session: ISession) => {
      const api = '/userbook/preference/presences.register';
      const data = (await fetchJSONWithCache(api)) as { preference: string };
      return data.preference;
    },
  },
  settings: {
    getAllowMultipleSlots: async (session: ISession, structureId: string) => {
      const api = `/presences/structures/${structureId}/settings/multiple-slots`;
      const data = (await fetchJSONWithCache(api)) as { allow_multiple_slots: boolean };
      return data.allow_multiple_slots;
    },
  },
  studentsEvents: {
    get: async (session: ISession, structureId: string, studentIds: string[], startDate: moment.Moment, endDate: moment.Moment) => {
      const api = `/presences/structures/${structureId}/students/events`;
      const body = JSON.stringify({
        student_ids: studentIds,
        start_at: startDate.format('YYYY-MM-DD'),
        end_at: endDate.format('YYYY-MM-DD'),
        types: ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'],
      });
      const events = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendStudentsEvents;
      return studentsEventsAdapter(events);
    },
  },
  userChildren: {
    get: async (session: ISession, relativeId: string) => {
      const api = `/presences/children?relativeId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(child => userChildAdapter(child)) as IUserChild[];
    },
  },
};
