/**
 * EDT actions
 */
import { ThunkAction } from 'redux-thunk';

import { getUserSession } from '~/framework/util/session';
import { createAsyncActionCreators } from '~/infra/redux/async2';
import { IEdtCourse, ISlot, IUserChild, actionTypes } from '~/modules/viescolaire/edt/reducer';
import { edtService } from '~/modules/viescolaire/edt/service';

/**
 * Fetch the courses of the specified groups.
 */
export const edtCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchEdtCoursesAction =
  (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    groups: string[],
    groupsIds: string[],
  ): ThunkAction<Promise<IEdtCourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(edtCoursesActionsCreators.request());
      const courses = await edtService.courses.get(session, structureId, startDate, endDate, groups, groupsIds);
      dispatch(edtCoursesActionsCreators.receipt(courses));
      return courses;
    } catch (e) {
      dispatch(edtCoursesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the courses of the specified teacher.
 */
export const fetchEdtTeacherCoursesAction =
  (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string,
  ): ThunkAction<Promise<IEdtCourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(edtCoursesActionsCreators.request());
      const courses = await edtService.courses.getFromTeacher(session, structureId, startDate, endDate, teacherId);
      dispatch(edtCoursesActionsCreators.receipt(courses));
      return courses;
    } catch (e) {
      dispatch(edtCoursesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the time slots.
 */
export const edtSlotsActionsCreators = createAsyncActionCreators(actionTypes.slots);
export const fetchEdtSlotsAction =
  (structureId: string): ThunkAction<Promise<ISlot[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(edtSlotsActionsCreators.request());
      const slots = await edtService.slots.get(session, structureId);
      dispatch(edtSlotsActionsCreators.receipt(slots));
      return slots;
    } catch (e) {
      dispatch(edtSlotsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the user children.
 */
export const edtUserChildrenActionsCreators = createAsyncActionCreators(actionTypes.userChildren);
export const fetchEdtUserChildrenAction = (): ThunkAction<Promise<IUserChild[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(edtUserChildrenActionsCreators.request());
    const userChildren = await edtService.userChildren.get(session);
    dispatch(edtUserChildrenActionsCreators.receipt(userChildren));
    return userChildren;
  } catch (e) {
    dispatch(edtUserChildrenActionsCreators.error(e as Error));
    throw e;
  }
};
