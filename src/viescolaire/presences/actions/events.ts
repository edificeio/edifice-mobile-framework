import moment from "moment";
import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { eventsService } from "../services/events";
import { actionTypes, IEvent } from "../state/events";

export const actions = createAsyncActionCreators<IEvent>(actionTypes);

export function postLateEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  registerId: number,
  courseStart: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(actions.request());
      const result = await eventsService.postLate(studentId, date, comment, registerId, courseStart);
      dispatch(actions.receipt(result));
    } catch (errmsg) {
      dispatch(actions.error(errmsg));
    }
  };
}

export function updateLateEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  eventId: number,
  registerId: number,
  courseStart: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(actions.request());
      const result = await eventsService.putLate(studentId, date, comment, eventId, registerId, courseStart);
      dispatch(actions.receipt(result));
    } catch (errmsg) {
      dispatch(actions.error(errmsg));
    }
  };
}

export function deleteEvent(registerId: number, eventId: number) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(actions.request());
      const result = await eventsService.deleteEvent(registerId, eventId);
      dispatch(actions.receipt(result));
    } catch (errmsg) {
      dispatch(actions.error(errmsg));
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
      dispatch(actions.request());
      const result = await eventsService.postLeaving(studentId, date, comment, registerId, courseEnd);
      dispatch(actions.receipt(result));
    } catch (errmsg) {
      dispatch(actions.error(errmsg));
    }
  };
}

export function updateLeavingEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  eventId: number,
  registerId: number,
  courseEnd: moment.Moment
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(actions.request());
      const result = await eventsService.putLeaving(studentId, date, comment, eventId, registerId, courseEnd);
      dispatch(actions.receipt(result));
    } catch (errmsg) {
      dispatch(actions.error(errmsg));
    }
  };
}
