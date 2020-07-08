import moment from "moment";

import { fetchJSONWithCache, fetchWithCache } from "../../../infra/fetchWithCache";
import { IEvent } from "../state/events";

export type IEventBackend = {
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

const eventAdapter: (data: IEventBackend) => IEvent = data => {
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

export const eventsService = {
  postLate: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    registerId: number,
    courseStart: moment.Moment
  ) => {
    const stringDate = date.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseStart = courseStart.format("YYYY-MM-DD HH:mm:ss");
    const result: IEventBackend = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 2,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: "post",
    });
    return eventAdapter(result);
  },
  putLate: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseStart: moment.Moment
  ) => {
    const stringDate = date.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseStart = courseStart.format("YYYY-MM-DD HH:mm:ss");
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 2,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: "put",
    });
    return eventAdapter(result);
  },
  postLeaving: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    registerId: number,
    courseEnd: moment.Moment
  ) => {
    const stringDate = date.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseEnd = courseEnd.format("YYYY-MM-DD HH:mm:ss");
    const result = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 3,
        start_date: stringDate,
        end_date: stringCourseEnd,
        comment,
      }),
      method: "post",
    });
    return eventAdapter(result);
  },
  putLeaving: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseEnd: moment.Moment
  ) => {
    const stringDate = date.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseEnd = courseEnd.format("YYYY-MM-DD HH:mm:ss");
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 3,
        start_date: stringDate,
        end_date: stringCourseEnd,
        comment,
      }),
      method: "put",
    });
    return eventAdapter(result);
  },
  postAbsent: async (studentId: string, registerId: number, courseStart: moment.Moment, courseEnd: moment.Moment) => {
    const stringCourseEnd = courseEnd.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseStart = courseStart.format("YYYY-MM-DD HH:mm:ss");
    const result: IEventBackend = await fetchJSONWithCache(`/presences/events`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 1,
        start_date: stringCourseStart,
        end_date: stringCourseEnd,
      }),
      method: "post",
    });
    return eventAdapter(result);
  },
  putAbsent: async (
    studentId: string,
    date: moment.Moment,
    comment: string,
    eventId: number,
    registerId: number,
    courseStart: moment.Moment
  ) => {
    const stringDate = date.format("YYYY-MM-DD HH:mm:ss");
    const stringCourseStart = courseStart.format("YYYY-MM-DD HH:mm:ss");
    const result = await fetchJSONWithCache(`/presences/events/${eventId}`, {
      body: JSON.stringify({
        student_id: studentId,
        register_id: registerId,
        type_id: 1,
        end_date: stringDate,
        start_date: stringCourseStart,
        comment,
      }),
      method: "put",
    });
    return eventAdapter(result);
  },
  deleteEvent: async (eventId: number) => {
    await fetchJSONWithCache(`/presences/events/${eventId}`, {
      method: "delete",
    });
  },
  updateRegisterStatus: async (registerId: number, status: number) => {
    await fetchWithCache(`/presences/registers/${registerId}/status`, {
      body: JSON.stringify({
        state_id: status,
      }),
      method: "put",
    });
  },
};
