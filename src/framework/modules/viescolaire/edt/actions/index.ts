/**
 * EDT actions
 */
import { ThunkAction } from 'redux-thunk';

import { IUser } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { IClassGroups } from '~/framework/modules/viescolaire/common/model/class-groups';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import { IClass, IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import { actionTypes } from '~/framework/modules/viescolaire/edt/reducer';
import { edtService } from '~/framework/modules/viescolaire/edt/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the classes.
 */
export const edtClassesActionsCreators = createAsyncActionCreators(actionTypes.classes);
export const fetchEdtClassesAction =
  (structureId: string): ThunkAction<Promise<IClass[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(edtClassesActionsCreators.request());
      const classes = await edtService.classes.get(session, structureId);
      dispatch(edtClassesActionsCreators.receipt(classes));
      return classes;
    } catch (e) {
      dispatch(edtClassesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the class groups.
 */
export const edtClassGroupsActionsCreators = createAsyncActionCreators(actionTypes.classGroups);
export const fetchEdtClassGroupsAction =
  (classes: string, studentId?: string): ThunkAction<Promise<IClassGroups[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(edtClassGroupsActionsCreators.request());
      const classGroups = await viescoService.classGroups.get(session, classes, studentId);
      dispatch(edtClassGroupsActionsCreators.receipt(classGroups));
      return classGroups;
    } catch (e) {
      dispatch(edtClassGroupsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the courses of the specified groups.
 */
export const edtCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchEdtCoursesAction =
  (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    classGroups: IClassGroups[],
  ): ThunkAction<Promise<IEdtCourse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(edtCoursesActionsCreators.request());
      const groupIds: string[] = [];
      const groupNames: string[] = [];
      classGroups.forEach(c => {
        groupIds.push(...c.groupIds);
        groupNames.push(...c.groupNames);
        if (c.classId) groupIds.push(c.classId);
        if (c.className) groupNames.push(c.className);
      });
      const courses = await edtService.courses.get(session, structureId, startDate, endDate, groupIds, groupNames);
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
      const session = assertSession();
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
 * Fetch the teachers.
 */
export const edtTeachersActionsCreators = createAsyncActionCreators(actionTypes.teachers);
export const fetchEdtTeachersAction =
  (structureId: string): ThunkAction<Promise<IUser[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(edtTeachersActionsCreators.request());
      const teachers = await viescoService.teachers.get(session, structureId);
      dispatch(edtTeachersActionsCreators.receipt(teachers));
      return teachers;
    } catch (e) {
      dispatch(edtTeachersActionsCreators.error(e as Error));
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
      const session = assertSession();
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
    const session = assertSession();
    dispatch(edtUserChildrenActionsCreators.request());
    const userChildren = await edtService.userChildren.get(session);
    dispatch(edtUserChildrenActionsCreators.receipt(userChildren));
    return userChildren;
  } catch (e) {
    dispatch(edtUserChildrenActionsCreators.error(e as Error));
    throw e;
  }
};
