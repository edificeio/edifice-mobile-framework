import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { coursesService } from "../services/teacherCourses";
import { ICoursesList, actionTypes } from "../state/teacherCourses";

export const dataActions = createAsyncActionCreators<ICoursesList>(actionTypes);

export function fetchCoursesAction(teacherId: string, structureId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesService.get(teacherId, structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
