import moment from 'moment';
import { Dispatch } from 'redux';

import { coursesService } from '~/framework/modules/viescolaire/dashboard/services/courses';
import { ICourseList, actionTypes } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ICourseList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchCourseListAction(structureId: string, startDate: moment.Moment, endDate: moment.Moment, groups: string[]) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesService.getCoursesFromClass(structureId, startDate, endDate, groups);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchCourseListFromTeacherAction(
  structureId: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  teacherId: string,
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesService.getCoursesFromTeacher(structureId, startDate, endDate, teacherId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
