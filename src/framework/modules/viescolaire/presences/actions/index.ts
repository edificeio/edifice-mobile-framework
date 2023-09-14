/**
 * Presences actions
 */
import { Moment } from 'moment';
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import {
  IAbsence,
  IChildrenEvents,
  IClassCall,
  ICourse,
  IEventReason,
  IForgottenNotebook,
  IHistory,
  IHistoryEvent,
  IIncident,
  IPunishment,
  IUserChild,
  compareEvents,
} from '~/framework/modules/viescolaire/presences/model';
import { actionTypes } from '~/framework/modules/viescolaire/presences/reducer';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const presencesAbsencesActionsCreators = createAsyncActionCreators(actionTypes.absences);
export const fetchPresencesAbsencesAction =
  (studentId: string, structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IAbsence[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesAbsencesActionsCreators.request());
      const absences = await presencesService.absences.get(session, studentId, structureId, startDate, endDate);
      dispatch(presencesAbsencesActionsCreators.receipt(absences));
      return absences;
    } catch (e) {
      dispatch(presencesAbsencesActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesChildrenEventsActionsCreators = createAsyncActionCreators(actionTypes.childrenEvents);
export const fetchPresencesChildrenEventsAction =
  (structureId: string, studentIds: string[]): ThunkAction<Promise<IChildrenEvents>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesChildrenEventsActionsCreators.request());
      const events = await presencesService.studentsEvents.get(session, structureId, studentIds);
      dispatch(presencesChildrenEventsActionsCreators.receipt(events));
      return events;
    } catch (e) {
      dispatch(presencesChildrenEventsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesClassCallActionsCreators = createAsyncActionCreators(actionTypes.classCall);
export const fetchPresencesClassCallAction =
  (id: number): ThunkAction<Promise<IClassCall>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesClassCallActionsCreators.request());
      const classCall = await presencesService.classCall.get(session, id);
      dispatch(presencesClassCallActionsCreators.receipt(classCall));
      return classCall;
    } catch (e) {
      dispatch(presencesClassCallActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchPresencesCoursesAction =
  (
    teacherId: string,
    structureIds: string[],
    date: Moment,
    allowMultipleSlots?: boolean,
  ): ThunkAction<Promise<ICourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      let courses: ICourse[] = [];
      const session = assertSession();
      const state = getState();
      const dateStr = date.format('YYYY-MM-DD');
      dispatch(presencesCoursesActionsCreators.request());
      for (const structureId of structureIds) {
        courses = courses.concat(
          await presencesService.courses.get(session, teacherId, structureId, dateStr, dateStr, allowMultipleSlots),
        );
      }
      dispatch(presencesCoursesActionsCreators.receipt({ ...state.presences.courses.data, [dateStr]: courses }));
      return courses;
    } catch (e) {
      dispatch(presencesCoursesActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesEventReasonsActionsCreators = createAsyncActionCreators(actionTypes.eventReasons);
export const fetchPresencesEventReasonsAction =
  (structureId: string): ThunkAction<Promise<IEventReason[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesEventReasonsActionsCreators.request());
      const eventReasons = await presencesService.eventReasons.get(session, structureId);
      dispatch(presencesEventReasonsActionsCreators.receipt(eventReasons));
      return eventReasons;
    } catch (e) {
      dispatch(presencesEventReasonsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesHistoryActionsCreators = createAsyncActionCreators(actionTypes.history);
export const fetchPresencesHistoryAction =
  (
    studentId: string,
    structureId: string,
    startDate: string,
    endDate: string,
  ): ThunkAction<Promise<(IAbsence | IForgottenNotebook | IHistoryEvent | IIncident | IPunishment)[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesHistoryActionsCreators.request());
      const events = await presencesService.history.getEvents(session, studentId, structureId, startDate, endDate);
      const { FORGOTTEN_NOTEBOOK } = await presencesService.history.getForgottenNotebookEvents(
        session,
        studentId,
        structureId,
        startDate,
        endDate,
      );
      const { INCIDENT, PUNISHMENT } = await presencesService.history.getIncidents(
        session,
        studentId,
        structureId,
        startDate,
        endDate,
      );
      const history = [
        ...events.DEPARTURE.events,
        ...events.LATENESS.events,
        ...events.NO_REASON.events,
        ...events.REGULARIZED.events,
        ...events.UNREGULARIZED.events,
        ...FORGOTTEN_NOTEBOOK.events,
        ...INCIDENT.events,
        ...PUNISHMENT.events,
      ].sort(compareEvents);
      dispatch(presencesHistoryActionsCreators.receipt(history));
      return history;
    } catch (e) {
      dispatch(presencesHistoryActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesMultipleSlotActionsCreators = createAsyncActionCreators(actionTypes.multipleSlotsSetting);
export const fetchPresencesMultipleSlotSettingAction =
  (structureId: string): ThunkAction<Promise<boolean>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesMultipleSlotActionsCreators.request());
      const allowMultipleSlots = await presencesService.settings.getAllowMultipleSlots(session, structureId);
      dispatch(presencesMultipleSlotActionsCreators.receipt(allowMultipleSlots));
      return allowMultipleSlots;
    } catch (e) {
      dispatch(presencesMultipleSlotActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesRegisterPreferenceActionsCreators = createAsyncActionCreators(actionTypes.registerPreference);
export const fetchPresencesRegisterPreferenceAction =
  (): ThunkAction<Promise<string>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesRegisterPreferenceActionsCreators.request());
      const registerPreference = await presencesService.preferences.getRegister(session);
      dispatch(presencesRegisterPreferenceActionsCreators.receipt(registerPreference));
      return registerPreference;
    } catch (e) {
      dispatch(presencesRegisterPreferenceActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesSchoolYearActionsCreators = createAsyncActionCreators(actionTypes.schoolYear);
export const fetchPresencesSchoolYearAction =
  (structureId: string): ThunkAction<Promise<ISchoolYear>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesSchoolYearActionsCreators.request());
      const schoolYear = await viescoService.schoolYear.get(session, structureId);
      dispatch(presencesSchoolYearActionsCreators.receipt(schoolYear));
      return schoolYear;
    } catch (e) {
      dispatch(presencesSchoolYearActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesStatisticsActionsCreators = createAsyncActionCreators(actionTypes.statistics);
export const fetchPresencesStatisticsAction =
  (studentId: string, structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IHistory>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesStatisticsActionsCreators.request());
      const statistics: IHistory = {
        ...(await presencesService.history.getEvents(session, studentId, structureId, startDate, endDate)),
        ...(await presencesService.history.getForgottenNotebookEvents(session, studentId, structureId, startDate, endDate)),
        ...(await presencesService.history.getIncidents(session, studentId, structureId, startDate, endDate)),
      };
      dispatch(presencesStatisticsActionsCreators.receipt(statistics));
      return statistics;
    } catch (e) {
      dispatch(presencesStatisticsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesTermsActionsCreators = createAsyncActionCreators(actionTypes.terms);
export const fetchPresencesTermsAction =
  (structureId: string, groupId: string): ThunkAction<Promise<ITerm[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesTermsActionsCreators.request());
      const terms = await viescoService.terms.get(session, structureId, groupId);
      dispatch(presencesTermsActionsCreators.receipt(terms));
      return terms;
    } catch (e) {
      dispatch(presencesTermsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesUserChildrenActionsCreators = createAsyncActionCreators(actionTypes.userChildren);
export const fetchPresencesUserChildrenAction =
  (relativeId: string): ThunkAction<Promise<IUserChild[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesUserChildrenActionsCreators.request());
      const userChildren = await presencesService.userChildren.get(session, relativeId);
      dispatch(presencesUserChildrenActionsCreators.receipt(userChildren));
      return userChildren;
    } catch (e) {
      dispatch(presencesUserChildrenActionsCreators.error(e as Error));
      throw e;
    }
  };
