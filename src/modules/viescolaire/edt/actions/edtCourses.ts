import moment from 'moment';
import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { edtCoursesService } from '~/modules/viescolaire/edt/services/edtCourses';
import { IEdtCourseList, actionTypes } from '~/modules/viescolaire/edt/state/edtCourses';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IEdtCourseList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchEdtCourseListAction(
  structureId: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  groups: string[],
  groupsIds: string[],
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await edtCoursesService.getEdtCoursesFromClass(structureId, startDate, endDate, groups, groupsIds);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchEdtCourseListFromTeacherAction(
  structureId: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  teacherId: string,
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await edtCoursesService.getEdtCoursesFromTeacher(structureId, startDate, endDate, teacherId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
