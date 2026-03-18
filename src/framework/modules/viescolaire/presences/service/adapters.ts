import moment from 'moment';

import {
  Absence,
  Call,
  CallEvent,
  ChildEvents,
  CommonEvent,
  Course,
  EventReason,
  EventType,
  PresencesUserChild,
  Statistics,
} from '~/framework/modules/viescolaire/presences/model';
import {
  BackendAbsences,
  BackendCall,
  BackendCourse,
  BackendEvent,
  BackendEventReason,
  BackendForgottenNotebooks,
  BackendHistoryEvent,
  BackendHistoryEvents,
  BackendIncidents,
  BackendStudentEvents,
  BackendStudentsEvents,
  BackendUserChild,
} from '~/framework/modules/viescolaire/presences/service/types';

export const eventAdapter = (data: BackendEvent): CallEvent => {
  return {
    comment: data.comment,
    endDate: moment(data.end_date),
    id: data.id,
    reasonId: data.reason_id,
    startDate: moment(data.start_date),
    typeId: data.type_id,
  };
};

export const callAdapter = (data: BackendCall): Call => {
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

export const courseAdapter = (data: BackendCourse): Course => {
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

export const eventReasonAdapter = (data: BackendEventReason): EventReason => {
  return {
    id: data.id,
    label: data.label,
    reasonTypeId: data.reason_type_id,
  };
};

export const absencesAdapter = (data: BackendAbsences): Absence[] => {
  return data.all.map(absence => ({
    description: absence.description,
    endDate: moment(absence.end_at),
    id: absence.id.toString(),
    startDate: moment(absence.start_at),
    studentFirstName: absence.student.firstName,
    type: EventType.STATEMENT_ABSENCE,
  }));
};

export const historyEventAdapter = (data: BackendHistoryEvent, type: EventType): CommonEvent => {
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

export const historyEventsAdapter = (
  data: BackendHistoryEvents,
): Omit<Statistics, 'FORGOTTEN_NOTEBOOK' | 'INCIDENT' | 'PUNISHMENT'> => {
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

export const forgottenNotebooksAdapter = (data: BackendForgottenNotebooks): Pick<Statistics, 'FORGOTTEN_NOTEBOOK'> => {
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

export const incidentsAdapter = (data: BackendIncidents): Pick<Statistics, 'INCIDENT' | 'PUNISHMENT'> => {
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

export const areEventsListed = (events: BackendStudentEvents): boolean => {
  return (
    events.all.DEPARTURE.length > 0 ||
    events.all.LATENESS.length > 0 ||
    events.all.NO_REASON.length > 0 ||
    events.all.REGULARIZED.length > 0 ||
    events.all.UNREGULARIZED.length > 0
  );
};

export const studentsEventsAdapter = (data: BackendStudentsEvents): { [key: string]: ChildEvents } => {
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

export const userChildAdapter = (data: BackendUserChild): PresencesUserChild => {
  return {
    birth: data.birth,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structures: data.structures,
  };
};
