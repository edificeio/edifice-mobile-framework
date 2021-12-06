import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { coursesService } from '~/modules/viescolaire/presences/services/teacherCourses';
import { ICoursesList, actionTypes } from '~/modules/viescolaire/presences/state/teacherCourses';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ICoursesList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchCoursesAction(
  teacherId: string,
  structureId: string,
  startDate: string,
  endDate: string,
  multipleSlot?: boolean,
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesService.get(teacherId, structureId, startDate, endDate, multipleSlot);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
