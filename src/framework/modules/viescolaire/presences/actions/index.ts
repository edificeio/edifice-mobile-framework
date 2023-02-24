/**
 * Presences actions
 */
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import { IClassCall, ICourse, IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import { actionTypes } from '~/framework/modules/viescolaire/presences/reducer';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch multiple slots setting.
 */
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

/**
 * Fetch class call at the specified identifier.
 */
export const presencesClassCallActionsCreators = createAsyncActionCreators(actionTypes.classCall);
export const fetchPresencesClassCallAction =
  (id: string): ThunkAction<Promise<IClassCall>, any, any, any> =>
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

/**
 * Fetch teacher courses.
 */
export const presencesCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchPresencesCoursesAction =
  (
    teacherId: string,
    structureId: string,
    startDate: string,
    endDate: string,
    allowMultipleSlots?: boolean,
  ): ThunkAction<Promise<ICourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesCoursesActionsCreators.request());
      const courses = await presencesService.courses.get(session, teacherId, structureId, startDate, endDate, allowMultipleSlots);
      dispatch(presencesCoursesActionsCreators.receipt(courses));
      return courses;
    } catch (e) {
      dispatch(presencesCoursesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch events history.
 */
export const presencesHistoryActionsCreators = createAsyncActionCreators(actionTypes.history);
export const fetchPresencesHistoryAction =
  (studentId: string, structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IHistory>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesHistoryActionsCreators.request());
      const events = await presencesService.history.getEvents(session, studentId, structureId, startDate, endDate);
      const forgottenNotebooks = await presencesService.history.getForgottenNotebookEvents(
        session,
        studentId,
        structureId,
        startDate,
        endDate,
      );
      const { incidents, punishments } = await presencesService.history.getIncidents(
        session,
        studentId,
        structureId,
        startDate,
        endDate,
      );
      const history: IHistory = {
        ...events,
        forgottenNotebooks,
        incidents,
        punishments,
      };
      dispatch(presencesHistoryActionsCreators.receipt(history));
      return history;
    } catch (e) {
      dispatch(presencesHistoryActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch register preference.
 */
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

/**
 * Fetch the school year.
 */
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

/**
 * Fetch the school terms.
 */
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

/**
 * Fetch user children.
 */
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
