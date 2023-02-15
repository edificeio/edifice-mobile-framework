/**
 * Presences actions
 */
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { ICourse, IUserChild } from '~/framework/modules/viescolaire/presences/model';
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
 * Fetch teacher courses.
 */
export const presencesCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchPresencesCoursesAction =
  (
    structureId: string,
    teacherId: string,
    startDate: string,
    endDate: string,
    allowMultipleSlots?: boolean,
  ): ThunkAction<Promise<ICourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesCoursesActionsCreators.request());
      const courses = await presencesService.courses.get(session, structureId, teacherId, startDate, endDate, allowMultipleSlots);
      dispatch(presencesCoursesActionsCreators.receipt(courses));
      return courses;
    } catch (e) {
      dispatch(presencesCoursesActionsCreators.error(e as Error));
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
