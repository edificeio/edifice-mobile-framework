import moment, { Moment } from 'moment';
import querystring from 'querystring';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import {
  Absence,
  Call,
  CallEvent,
  CallEventType,
  CallState,
  ChildEvents,
  CommonEvent,
  Course,
  EventReason,
  EventType,
  PresencesUserChild,
  Statistics,
} from '~/framework/modules/viescolaire/presences/model';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache, fetchWithCache, signedFetch } from '~/infra/fetchWithCache';

type BackendCall = {
  personnel_id: string;
  proof_id: string | null;
  course_id: string;
  owner: string;
  notified: boolean;
  subject_id: string;
  start_date: string;
  end_date: string;
  structure_id: string;
  counsellor_input: boolean;
  state_id: number;
  groups: {
    id: string;
    type: string;
  }[];
  students: {
    id: string;
    name: string;
    birth_day: string | null;
    group: string;
    group_name: string;
    events: BackendEvent[];
    last_course_absent: boolean;
    forgotten_notebook: boolean;
    day_history: {
      events: BackendEvent[];
      start: string;
      end: string;
      name: string;
    }[];
    exempted: boolean;
    exemptions: any[];
  }[];
  teachers: {
    id: string;
    displayName: string;
    functions: string;
  }[];
};

type BackendCourse = {
  structureId: string;
  subjectId: string;
  classes: string[];
  exceptionnal: string;
  groups: string[];
  roomLabels: string[];
  events: any[];
  splitCourses: any | null;
  exempted: boolean | null;
  exemption: any | null;
  incident: any | null;
  punishments: any[];
  dayOfWeek: number;
  manual: boolean;
  locked: boolean | null;
  updated: string;
  lastUser: string;
  startDate: string;
  endDate: string;
  color: string;
  subjectName: string;
  teachers: {
    id: string;
    displayName: string;
  }[];
  registerId: number | null;
  registerStateId: number;
  notified: boolean;
  splitSlot: boolean;
  timestamp: number;
  subject: {
    id: string;
    externalId: string;
    code: string;
    name: string;
    rank: number;
  };
  isOpenedByPersonnel: boolean;
  allowRegister: boolean;
  recurrent: boolean | null;
  periodic: boolean | null;
  id: string;
};

type BackendEvent = {
  id: number;
  owner: {
    id: string;
    displayName: string;
    info: string | null;
    firstName: string;
    lastName: string;
  };
  comment: string;
  type_id: number;
  end_date: string;
  followed: boolean;
  reason_id: number | null;
  massmailed: boolean;
  start_date: string;
  register_id: string;
  counsellor_input: boolean;
  counsellor_regularisation: boolean;
  type: string;
};

type BackendEventReason = {
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

type BackendAbsences = {
  all: {
    id: number;
    start_at: string;
    end_at: string;
    structure_id: string;
    description: string;
    treated_at: string | null;
    validator_id: string | null;
    attachment_id: string | null;
    created_at: string;
    parent_id: string;
    metadata: string | null;
    student: {
      id: string;
      name: string;
      lastName: string;
      firstName: string;
      className: string;
      structure_id: string;
    };
  }[];
  page_count: number;
};

type BackendHistoryEvent = {
  id: number;
  start_date: string;
  end_date: string;
  comment: string;
  counsellor_input: boolean;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id: number | null;
  owner: string;
  created: string;
  counsellor_regularisation: boolean;
  followed: boolean;
  massmailed: boolean;
  display_start_date: string;
  display_end_date: string;
  reason: {
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
  } | null;
};

type BackendHistoryEvents = {
  all: {
    DEPARTURE: BackendHistoryEvent[];
    NO_REASON: BackendHistoryEvent[];
    REGULARIZED: BackendHistoryEvent[];
    LATENESS: BackendHistoryEvent[];
    UNREGULARIZED: BackendHistoryEvent[];
  };
  totals: {
    DEPARTURE: number;
    NO_REASON: number;
    REGULARIZED: number;
    LATENESS: number;
    UNREGULARIZED: number;
  };
  recovery_method: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
};

type BackendForgottenNotebooks = {
  all: {
    id: number;
    student_id: string;
    structure_id: string;
    date: string;
  }[];
  totals: number;
};

type BackendIncidents = {
  all: {
    INCIDENT: {
      id: number;
      owner: string;
      structure_id: string;
      date: string;
      selected_hour: boolean;
      description: string;
      created: string;
      processed: boolean;
      place_id: number;
      partner_id: number;
      type_id: number;
      seriousness_id: number;
      place: string;
      incident_type: string;
      student_id: string;
      protagonist_type: string;
      protagonist_type_id: number;
      protagonist: {
        id: number;
        structure_id: string;
        label: string;
        hidden: boolean;
        created: string;
        used: boolean;
      };
      type: {
        id: number;
        structure_id: string;
        label: string;
        hidden: boolean;
        created: string;
        used: boolean;
      };
    }[];
    PUNISHMENT: {
      _id: string;
      type_id: number;
      owner_id: string;
      description: string;
      student_id: string;
      structure_id: string;
      processed: boolean;
      incident_id: number | null;
      fields: {
        start_at: string;
        end_at: string;
      };
      id: string;
      created_at: string;
      updated_at: string | null;
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        displayName: string;
      };
      student: {
        id: string;
        name: string;
        lastName: string;
        firstName: string;
        className: string;
        structure_id: string;
      };
      type: {
        id: number;
        structure_id: string;
        label: string;
        type: string;
        punishment_category_id: number;
        hidden: boolean;
        created: string;
      };
    }[];
  };
  totals: {
    INCIDENT: number;
    PUNISHMENT: number;
  };
};

type BackendStudentEvents = {
  all: {
    DEPARTURE: BackendEvent[];
    LATENESS: BackendEvent[];
    NO_REASON: BackendEvent[];
    REGULARIZED: BackendEvent[];
    UNREGULARIZED: BackendEvent[];
  };
  totals: {
    DEPARTURE: number;
    LATENESS: number;
    NO_REASON: number;
    REGULARIZED: number;
    UNREGULARIZED: number;
  };
};

type BackendStudentsEvents = {
  limit: number | null;
  offset: number | null;
  recovery_method: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
  students_events: { [studentId: string]: BackendStudentEvents };
};

type BackendUserChild = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  birth: string;
  structures: {
    id: string;
    name: string;
    classes: {
      name: string;
      id: string;
      structure: string;
    }[];
  }[];
};

type BackendCourseList = BackendCourse[];
type BackendEventReasonList = BackendEventReason[];
type BackendUserChildren = BackendUserChild[];

const eventAdapter = (data: BackendEvent): CallEvent => {
  return {
    comment: data.comment,
    endDate: moment(data.end_date),
    id: data.id,
    reasonId: data.reason_id,
    startDate: moment(data.start_date),
    typeId: data.type_id,
  };
};

const callAdapter = (data: BackendCall): Call => {
  return {
    courseId: data.course_id,
    endDate: moment(data.end_date),
    startDate: moment(data.start_date),
    stateId: data.state_id,
    structureId: data.structure_id,
    students: data.students.map(student => ({
      events: student.events.map(eventAdapter),
      exempted: student.exempted,
      exemption_attendance: student.exemptions[0] ? !student.exemptions[0].attendance : false,
      forgottenNotebook: student.forgotten_notebook,
      group: student.group,
      groupName: student.group_name,
      id: student.id,
      lastCourseAbsent: student.last_course_absent,
      name: student.name,
    })),
    subjectId: data.subject_id,
  };
};

const courseAdapter = (data: BackendCourse): Course => {
  return {
    callId: data.registerId,
    callStateId: data.registerStateId,
    classes: data.classes,
    endDate: moment(data.endDate),
    groups: data.groups,
    id: data.id,
    roomLabels: data.roomLabels,
    startDate: moment(data.startDate),
    structureId: data.structureId,
    subjectId: data.subjectId,
  };
};

const eventReasonAdapter = (data: BackendEventReason): EventReason => {
  return {
    id: data.id,
    label: data.label,
    reasonTypeId: data.reason_type_id,
  };
};

const absencesAdapter = (data: BackendAbsences): Absence[] => {
  return data.all.map(absence => ({
    description: absence.description,
    endDate: moment(absence.end_at),
    id: absence.id.toString(),
    startDate: moment(absence.start_at),
    studentFirstName: absence.student.firstName,
    type: EventType.STATEMENT_ABSENCE,
  }));
};

const historyEventAdapter = (data: BackendHistoryEvent, type: EventType): CommonEvent => {
  return {
    comment: data.comment,
    endDate: moment(data.end_date),
    id: data.id.toString(),
    reasonLabel: data.reason?.label,
    startDate: moment(data.start_date),
    type,
    typeId: data.type_id,
  };
};

const historyEventsAdapter = (data: BackendHistoryEvents): Omit<Statistics, 'FORGOTTEN_NOTEBOOK' | 'INCIDENT' | 'PUNISHMENT'> => {
  return {
    DEPARTURE: {
      events: data.all.DEPARTURE.map(event => historyEventAdapter(event, EventType.DEPARTURE)),
      total: data.totals.DEPARTURE,
    },
    LATENESS: {
      events: data.all.LATENESS.map(event => historyEventAdapter(event, EventType.LATENESS)),
      total: data.totals.LATENESS,
    },
    NO_REASON: {
      events: data.all.NO_REASON.map(event => historyEventAdapter(event, EventType.NO_REASON)),
      total: data.totals.NO_REASON,
    },
    recoveryMethod: data.recovery_method,
    REGULARIZED: {
      events: data.all.REGULARIZED.map(event => historyEventAdapter(event, EventType.REGULARIZED)),
      total: data.totals.REGULARIZED,
    },
    UNREGULARIZED: {
      events: data.all.UNREGULARIZED.map(event => historyEventAdapter(event, EventType.UNREGULARIZED)),
      total: data.totals.UNREGULARIZED,
    },
  };
};

const forgottenNotebooksAdapter = (data: BackendForgottenNotebooks): Pick<Statistics, 'FORGOTTEN_NOTEBOOK'> => {
  return {
    FORGOTTEN_NOTEBOOK: {
      events: data.all.map(event => ({
        date: moment(event.date),
        id: event.id.toString(),
        type: EventType.FORGOTTEN_NOTEBOOK,
      })),
      total: data.totals,
    },
  };
};

const incidentsAdapter = (data: BackendIncidents): Pick<Statistics, 'INCIDENT' | 'PUNISHMENT'> => {
  return {
    INCIDENT: {
      events: data.all.INCIDENT.map(i => ({
        date: moment(i.date),
        description: i.description,
        id: i.id.toString(),
        protagonist: i.protagonist,
        type: EventType.INCIDENT,
        typeLabel: i.type.label,
      })),
      total: data.totals.INCIDENT,
    },
    PUNISHMENT: {
      events: data.all.PUNISHMENT.map(p => ({
        createdAt: moment(p.created_at),
        endDate: moment(p.fields.end_at),
        id: p.id,
        punishmentCategoryId: p.type.punishment_category_id,
        startDate: moment(p.fields.start_at),
        type: EventType.PUNISHMENT,
        typeLabel: p.type.label,
      })),
      total: data.totals.PUNISHMENT,
    },
  };
};

const areEventsListed = (events: BackendStudentEvents): boolean => {
  return (
    events.all.DEPARTURE.length > 0 ||
    events.all.LATENESS.length > 0 ||
    events.all.NO_REASON.length > 0 ||
    events.all.REGULARIZED.length > 0 ||
    events.all.UNREGULARIZED.length > 0
  );
};

const studentsEventsAdapter = (data: BackendStudentsEvents): { [key: string]: ChildEvents } => {
  return Object.fromEntries(
    Object.entries(data.students_events)
      .filter(([id, events]) => areEventsListed(events))
      .map(([studentId, value]) => [
        studentId,
        {
          DEPARTURE: value.all.DEPARTURE.map(eventAdapter),
          LATENESS: value.all.LATENESS.map(eventAdapter),
          NO_REASON: value.all.NO_REASON.map(eventAdapter),
          REGULARIZED: value.all.REGULARIZED.map(eventAdapter),
          UNREGULARIZED: value.all.UNREGULARIZED.map(eventAdapter),
        },
      ]),
  );
};

const userChildAdapter = (data: BackendUserChild): PresencesUserChild => {
  return {
    birth: data.birth,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structures: data.structures,
  };
};

export const presencesService = {
  absence: {
    create: async (
      session: AuthLoggedAccount,
      structureId: string,
      studentId: string,
      startDate: Moment,
      endDate: Moment,
      description: string,
    ) => {
      const api = '/presences/statements/absences';
      const formData = new FormData();
      formData.append('structure_id', structureId);
      formData.append('student_id', studentId);
      formData.append('start_at', startDate.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('end_at', endDate.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('description', description);
      await signedFetch(`${session.platform.url}${api}`, {
        body: formData,
        method: 'POST',
      });
    },
    createWithFile: async (
      session: AuthLoggedAccount,
      structureId: string,
      studentId: string,
      startDate: Moment,
      endDate: Moment,
      description: string,
      file: LocalFile,
    ) => {
      const api = '/presences/statements/absences/attachment';
      const fields = {
        description,
        end_at: endDate.format('YYYY-MM-DD HH:mm:ss'),
        start_at: startDate.format('YYYY-MM-DD HH:mm:ss'),
        structure_id: structureId,
        student_id: studentId,
      };
      await fileTransferService.uploadFile(
        session,
        file,
        {
          fields,
          url: api,
        },
        res => {
          return res.id;
        },
      );
    },
  },
  absences: {
    get: async (session: AuthLoggedAccount, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/presences/statements/absences?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&student_id=${studentId}`;
      const absences = (await fetchJSONWithCache(api)) as BackendAbsences;
      return absencesAdapter(absences);
    },
  },
  call: {
    create: async (session: AuthLoggedAccount, course: Course, teacherId: string, allowMultipleSlots?: boolean) => {
      const api = '/presences/registers';
      const body = JSON.stringify({
        classes: course.classes ?? course.groups,
        course_id: course.id,
        end_date: course.endDate.format('YYYY-MM-DD HH:mm:ss'),
        groups: course.groups,
        split_slot: allowMultipleSlots,
        start_date: course.startDate.format('YYYY-MM-DD HH:mm:ss'),
        structure_id: course.structureId,
        subject_id: course.subjectId,
        teacherIds: [teacherId],
      });
      const call = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as { id: number };
      return call.id;
    },
    get: async (session: AuthLoggedAccount, id: number) => {
      const api = `/presences/registers/${id}`;
      const call = (await fetchJSONWithCache(api)) as BackendCall;
      return callAdapter(call);
    },
    updateState: async (session: AuthLoggedAccount, id: number, state: CallState) => {
      const api = `/presences/registers/${id}/status`;
      const body = JSON.stringify({
        state_id: state,
      });
      await fetchWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  courses: {
    get: async (
      session: AuthLoggedAccount,
      teacherId: string,
      structureId: string,
      startDate: string,
      endDate: string,
      allowMultipleSlots?: boolean,
    ) => {
      const api = `/presences/courses?${querystring.stringify({
        end: endDate,
        forgotten_registers: false,
        multiple_slot: allowMultipleSlots,
        start: startDate,
        structure: structureId,
        teacher: teacherId,
      })}`;
      const courses = (await fetchJSONWithCache(api)) as BackendCourseList;
      return courses
        .filter(course => course.allowRegister)
        .map(courseAdapter)
        .sort((a, b) => a.startDate.diff(b.startDate));
    },
  },
  event: {
    create: async (
      session: AuthLoggedAccount,
      studentId: string,
      callId: number,
      type: CallEventType,
      startDate: Moment,
      endDate: Moment,
      reasonId: number | null,
      comment?: string,
    ) => {
      const api = '/presences/events';
      const body = JSON.stringify({
        comment,
        end_date: endDate.format('YYYY-MM-DD HH:mm:ss'),
        reason_id: reasonId,
        register_id: callId,
        start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
        student_id: studentId,
        type_id: type as number,
      });
      const event = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as BackendEvent;
      return eventAdapter(event);
    },
    delete: async (session: AuthLoggedAccount, id: number) => {
      const api = `/presences/events/${id}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
    update: async (
      session: AuthLoggedAccount,
      id: number,
      studentId: string,
      callId: number,
      type: CallEventType,
      startDate: Moment,
      endDate: Moment,
      reasonId: number | null,
      comment?: string,
    ) => {
      const api = `/presences/events/${id}`;
      const body = JSON.stringify({
        comment,
        end_date: endDate.format('YYYY-MM-DD HH:mm:ss'),
        reason_id: reasonId,
        register_id: callId,
        start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
        student_id: studentId,
        type_id: type as number,
      });
      await fetchWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  eventReason: {
    update: async (
      session: AuthLoggedAccount,
      id: number,
      studentId: string,
      structureId: string,
      callId: number,
      type: CallEventType,
      startDate: Moment,
      endDate: Moment,
      reasonId: number | null,
    ) => {
      const api = '/presences/events/reason';
      const body = JSON.stringify({
        events: [
          {
            counsellor_input: true,
            end_date: endDate,
            id,
            reason_id: reasonId,
            register_id: callId,
            start_date: startDate,
            student_id: studentId,
            type_id: type,
          },
        ],
        reasonId,
        structure_id: structureId,
        student_id: studentId,
      });
      await fetchWithCache(api, {
        body,
        method: 'PUT',
      });
    },
  },
  eventReasons: {
    get: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/presences/reasons?structureId=${structureId}&reasonTypeId=0`;
      const eventReasons = (await fetchJSONWithCache(api)) as BackendEventReasonList;
      return eventReasons.filter(reason => !reason.hidden && reason.id >= 0).map(eventReasonAdapter);
    },
  },
  events: {
    get: async (session: AuthLoggedAccount, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/presences/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=NO_REASON&type=UNREGULARIZED&type=REGULARIZED&type=LATENESS&type=DEPARTURE`;
      const events = (await fetchJSONWithCache(api)) as BackendHistoryEvents;
      return historyEventsAdapter(events);
    },
    getForgottenNotebooks: async (
      session: AuthLoggedAccount,
      studentId: string,
      structureId: string,
      startDate: string,
      endDate: string,
    ) => {
      const api = `/presences/forgotten/notebook/student/${studentId}?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}`;
      const forgottenNotebooks = (await fetchJSONWithCache(api)) as BackendForgottenNotebooks;
      return forgottenNotebooksAdapter(forgottenNotebooks);
    },
    getIncidents: async (
      session: AuthLoggedAccount,
      studentId: string,
      structureId: string,
      startDate: string,
      endDate: string,
    ) => {
      const api = `/incidents/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=INCIDENT&type=PUNISHMENT`;
      const incidents = (await fetchJSONWithCache(api)) as BackendIncidents;
      return incidentsAdapter(incidents);
    },
  },
  initialization: {
    getStructureStatus: async (structureId: string) => {
      const api = `/presences/initialization/structures/${structureId}`;
      const data = (await fetchJSONWithCache(api)) as { initialized: boolean };
      return data.initialized;
    },
  },
  preferences: {
    getRegister: async (session: AuthLoggedAccount) => {
      const api = '/userbook/preference/presences.register';
      const data = (await fetchJSONWithCache(api)) as { preference: string };
      return data.preference;
    },
  },
  settings: {
    getAllowMultipleSlots: async (session: AuthLoggedAccount, structureId: string) => {
      const api = `/presences/structures/${structureId}/settings/multiple-slots`;
      const data = (await fetchJSONWithCache(api)) as { allow_multiple_slots: boolean };
      return data.allow_multiple_slots;
    },
  },
  studentsEvents: {
    get: async (session: AuthLoggedAccount, structureId: string, studentIds: string[]) => {
      const api = `/presences/structures/${structureId}/students/events`;
      const body = JSON.stringify({
        end_at: moment().format('YYYY-MM-DD'),
        start_at: moment().format('YYYY-MM-DD'),
        student_ids: studentIds,
        types: ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'],
      });
      const events = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as BackendStudentsEvents;
      return studentsEventsAdapter(events);
    },
  },
  userChildren: {
    get: async (session: AuthLoggedAccount, relativeId: string) => {
      const api = `/presences/children?relativeId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as BackendUserChildren;
      return userChildren.map(userChildAdapter);
    },
  },
};
