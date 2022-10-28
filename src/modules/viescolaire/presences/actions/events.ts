import I18n from 'i18n-js';
import moment from 'moment';
import Toast from 'react-native-tiny-toast';
import { Dispatch } from 'redux';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { eventsService } from '~/modules/viescolaire/presences/services/events';
import { studentEventsActionsTypes, teacherEventsActionsTypes } from '~/modules/viescolaire/presences/state/events';

export const callEventsActions = {
  post: data => ({ type: teacherEventsActionsTypes.post, data }),
  put: data => ({ type: teacherEventsActionsTypes.put, data }),
  delete: data => ({ type: teacherEventsActionsTypes.delete, data }),
  error: error => ({ type: teacherEventsActionsTypes.error, error }),
};

export const studentEventsActions = {
  event: data => ({ type: studentEventsActionsTypes.event, data }),
  notebook: data => ({ type: studentEventsActionsTypes.notebook, data }),
  incident: data => ({ type: studentEventsActionsTypes.incident, data }),
  clear: () => ({ type: studentEventsActionsTypes.clear }),
  error: data => ({ type: studentEventsActionsTypes.error, data }),
};

export function postLateEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  registerId: number,
  courseStart: moment.Moment,
) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postLate(studentId, date, comment, registerId, courseStart);
      eventsService.updateRegisterStatus(registerId, 2);
      Toast.showSuccess(I18n.t('viesco-latenesses-added'), { ...UI_ANIMATIONS.toast });
      dispatch(callEventsActions.post(result));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function updateLateEvent(
  student_id: string,
  date: moment.Moment,
  comment: string,
  id: number,
  register_id: number,
  course_start: moment.Moment,
) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.putLate(student_id, date, comment, id, register_id, course_start);
      eventsService.updateRegisterStatus(register_id, 2);
      Toast.showSuccess(I18n.t('viesco-latenesses-updated'), { ...UI_ANIMATIONS.toast });
      dispatch(callEventsActions.put({ id, student_id, comment, register_id, course_start, course_end: date }));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function deleteEvent(event) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.deleteEvent(event.id);
      eventsService.updateRegisterStatus(event.register_id, 2);
      dispatch(callEventsActions.delete(event));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function postLeavingEvent(
  studentId: string,
  date: moment.Moment,
  comment: string,
  registerId: number,
  courseEnd: moment.Moment,
) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postLeaving(studentId, date, comment, registerId, courseEnd);
      eventsService.updateRegisterStatus(registerId, 2);
      Toast.showSuccess(I18n.t('viesco-leaving-added'), { ...UI_ANIMATIONS.toast });
      dispatch(callEventsActions.post(result));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function updateLeavingEvent(
  student_id: string,
  date: moment.Moment,
  comment: string,
  id: number,
  register_id: number,
  course_end: moment.Moment,
) {
  return async (dispatch: Dispatch) => {
    try {
      await eventsService.putLeaving(student_id, date, comment, id, register_id, course_end);
      eventsService.updateRegisterStatus(register_id, 2);
      Toast.showSuccess(I18n.t('viesco-leaving-updated'), { ...UI_ANIMATIONS.toast });
      dispatch(callEventsActions.put({ id, student_id, comment, register_id, course_start: date, course_end }));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function postAbsentEvent(studentId: string, registerId: number, courseStart: moment.Moment, courseEnd: moment.Moment) {
  return async (dispatch: Dispatch) => {
    try {
      const result = await eventsService.postAbsent(studentId, registerId, courseStart, courseEnd);
      eventsService.updateRegisterStatus(registerId, 2);
      dispatch(callEventsActions.post(result));
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function validateRegisterAction(registerId: number) {
  return async (dispatch: Dispatch) => {
    try {
      eventsService.updateRegisterStatus(registerId, 3);
      Toast.showSuccess(I18n.t('viesco-register-validated'), { ...UI_ANIMATIONS.toast });
    } catch (errmsg) {
      dispatch(callEventsActions.error(errmsg));
    }
  };
}

export function getStudentEvents(studentId: string, structureId: string, startDate: moment.Moment, endDate: moment.Moment) {
  return async (dispatch: Dispatch) => {
    const promises: Promise<any>[] = [
      eventsService.fetchStudentEvents(studentId, structureId, startDate, endDate),
      eventsService.fetchStudentForgottenNotebook(studentId, structureId, startDate, endDate),
      eventsService.fetchStudentIncidents(studentId, structureId, startDate, endDate),
    ];
    Promise.all(promises)
      .then(([events, notebooks, incidents]) => {
        dispatch(studentEventsActions.event(events));
        dispatch(studentEventsActions.notebook(notebooks));
        dispatch(studentEventsActions.incident(incidents));
      })
      .catch(errmsg => {
        dispatch(studentEventsActions.error(errmsg));
      });
  };
}
