import moment, { Moment } from 'moment';
import querystring from 'querystring';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { CallEventType, CallState, Course } from '~/framework/modules/viescolaire/presences/model';
import {
  absencesAdapter,
  callAdapter,
  courseAdapter,
  eventAdapter,
  eventReasonAdapter,
  forgottenNotebooksAdapter,
  historyEventsAdapter,
  incidentsAdapter,
  studentsEventsAdapter,
  userChildAdapter,
} from '~/framework/modules/viescolaire/presences/service/adapters';
import {
  BackendAbsences,
  BackendCall,
  BackendCourseList,
  BackendEvent,
  BackendEventReasonList,
  BackendForgottenNotebooks,
  BackendHistoryEvents,
  BackendIncidents,
  BackendStudentsEvents,
  BackendUserChildren,
} from '~/framework/modules/viescolaire/presences/service/types';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { sessionFetch } from '~/framework/util/transport';

export const presencesService = {
  absence: {
    create: async (
      session: AuthActiveAccount,
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
      await sessionFetch(api, { body: formData, method: 'POST' });
    },
    createWithFile: async (
      session: AuthActiveAccount,
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
    get: async (session: AuthActiveAccount, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/presences/statements/absences?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&student_id=${studentId}`;
      const absences = await sessionFetch.json<BackendAbsences>(api);
      return absencesAdapter(absences);
    },
  },
  call: {
    create: async (session: AuthActiveAccount, course: Course, teacherId: string, allowMultipleSlots?: boolean) => {
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
      const call = await sessionFetch.json<{ id: number }>(api, { body, method: 'POST' });
      return call.id;
    },
    get: async (session: AuthActiveAccount, id: number) => {
      const api = `/presences/registers/${id}`;
      const call = await sessionFetch.json<BackendCall>(api);
      return callAdapter(call);
    },
    updateState: async (session: AuthActiveAccount, id: number, state: CallState) => {
      const api = `/presences/registers/${id}/status`;
      const body = JSON.stringify({
        state_id: state,
      });
      await sessionFetch(api, { body, method: 'PUT' });
    },
  },
  courses: {
    get: async (
      session: AuthActiveAccount,
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
      const courses = await sessionFetch.json<BackendCourseList>(api);
      return courses
        .filter(course => course.allowRegister)
        .map(courseAdapter)
        .sort((a, b) => a.startDate.diff(b.startDate));
    },
  },
  event: {
    create: async (
      session: AuthActiveAccount,
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
      const event = await sessionFetch.json<BackendEvent>(api, { body, method: 'POST' });
      return eventAdapter(event);
    },
    delete: async (session: AuthActiveAccount, id: number) => {
      const api = `/presences/events/${id}`;
      await sessionFetch.json(api, { method: 'DELETE' });
    },
    update: async (
      session: AuthActiveAccount,
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
      await sessionFetch(api, { body, method: 'PUT' });
    },
  },
  eventReason: {
    update: async (
      session: AuthActiveAccount,
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
      await sessionFetch(api, { body, method: 'PUT' });
    },
  },
  eventReasons: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/presences/reasons?structureId=${structureId}&reasonTypeId=0`;
      const eventReasons = await sessionFetch.json<BackendEventReasonList>(api);
      return eventReasons.filter(reason => !reason.hidden && reason.id >= 0).map(eventReasonAdapter);
    },
  },
  events: {
    get: async (session: AuthActiveAccount, studentId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/presences/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=NO_REASON&type=UNREGULARIZED&type=REGULARIZED&type=LATENESS&type=DEPARTURE`;
      const events = await sessionFetch.json<BackendHistoryEvents>(api);
      return historyEventsAdapter(events);
    },
    getForgottenNotebooks: async (
      session: AuthActiveAccount,
      studentId: string,
      structureId: string,
      startDate: string,
      endDate: string,
    ) => {
      const api = `/presences/forgotten/notebook/student/${studentId}?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}`;
      const forgottenNotebooks = await sessionFetch.json<BackendForgottenNotebooks>(api);
      return forgottenNotebooksAdapter(forgottenNotebooks);
    },
    getIncidents: async (
      session: AuthActiveAccount,
      studentId: string,
      structureId: string,
      startDate: string,
      endDate: string,
    ) => {
      const api = `/incidents/students/${studentId}/events?structure_id=${structureId}&start_at=${startDate}&end_at=${endDate}&type=INCIDENT&type=PUNISHMENT`;
      const incidents = await sessionFetch.json<BackendIncidents>(api);
      return incidentsAdapter(incidents);
    },
  },
  initialization: {
    getStructureStatus: async (structureId: string) => {
      const api = `/presences/initialization/structures/${structureId}`;
      const data = await sessionFetch.json<{ initialized: boolean }>(api);
      return data.initialized;
    },
  },
  preferences: {
    getRegister: async (session: AuthActiveAccount) => {
      const api = '/userbook/preference/presences.register';
      const data = await sessionFetch.json<{ preference: string }>(api);
      return data.preference;
    },
  },
  settings: {
    getAllowMultipleSlots: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/presences/structures/${structureId}/settings/multiple-slots`;
      const data = await sessionFetch.json<{ allow_multiple_slots: boolean }>(api);
      return data.allow_multiple_slots;
    },
  },
  studentsEvents: {
    get: async (session: AuthActiveAccount, structureId: string, studentIds: string[]) => {
      const api = `/presences/structures/${structureId}/students/events`;
      const body = JSON.stringify({
        end_at: moment().format('YYYY-MM-DD'),
        start_at: moment().format('YYYY-MM-DD'),
        student_ids: studentIds,
        types: ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'],
      });
      const events = await sessionFetch.json<BackendStudentsEvents>(api, { body, method: 'POST' });
      return studentsEventsAdapter(events);
    },
  },
  userChildren: {
    get: async (session: AuthActiveAccount, relativeId: string) => {
      const api = `/presences/children?relativeId=${relativeId}`;
      const userChildren = await sessionFetch.json<BackendUserChildren>(api);
      return userChildren.map(userChildAdapter);
    },
  },
};
