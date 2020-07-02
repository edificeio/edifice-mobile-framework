import moment from "moment";
import { Dispatch } from "redux";

import { eventsService } from "../services/events";
import { eventsActionsTypes } from "../state/events";

export const eventsActions = {
  post: data => ({ type: eventsActionsTypes.post, data }),
  put: data => ({ type: eventsActionsTypes.put, data }),
  delete: data => ({ type: eventsActionsTypes.delete, data }),
  error: error => ({ type: eventsActionsTypes.error, error }),
};

export function postLateEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  registerId: number,
  courseStart: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postLate(studentId, date, comment, registerId, courseStart);
      dispatch(eventsActions.post(result));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}

export function updateLateEvent(
  student_id: string,
  date: moment.Moment,
  comment: string,
  id: number,
  register_id: number,
  course_start: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.putLate(student_id, date, comment, id, register_id, course_start);
      dispatch(eventsActions.put({ id, student_id, comment, register_id, course_start, course_end: date }));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}

export function deleteEvent(event) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.deleteEvent(event.id);
      dispatch(eventsActions.delete(event));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}

export function postLeavingEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  registerId: number,
  courseEnd: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postLeaving(studentId, date, comment, registerId, courseEnd);
      dispatch(eventsActions.post(result));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}

export function updateLeavingEvent(
  student_id: string,
  date: moment.Moment,
  comment: string,
  id: number,
  register_id: number,
  course_end: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.putLeaving(student_id, date, comment, id, register_id, course_end);
      dispatch(eventsActions.put({ id, student_id, comment, register_id, course_start: date, course_end }));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}

export function postAbsentEvent(
  studentId: string,
  registerId: number,
  courseStart: moment.Moment,
  courseEnd: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postAbsent(studentId, registerId, courseStart, courseEnd);
      dispatch(eventsActions.post(result));
    } catch (errmsg) {
      dispatch(eventsActions.error(errmsg));
    }
  };
}
