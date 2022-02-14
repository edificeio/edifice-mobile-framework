import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { coursesRegisterService } from '~/modules/viescolaire/presences/services/teacherCourses';
import { ICoursesRegister, actionTypes } from '~/modules/viescolaire/presences/state/teacherCourseRegister';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ICoursesRegister>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchCoursesRegisterAction(course_data) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesRegisterService.get(course_data);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
