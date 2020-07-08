import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { coursesService, coursesRegisterService } from "../services/teacherCourses";
import { ICoursesList, actionTypes, ICoursesRegister, actionTypesRegister } from "../state/teacherCourses";

export const dataActions = createAsyncActionCreators<ICoursesList>(actionTypes);
export const dataActionsRegister = createAsyncActionCreators<ICoursesRegister>(actionTypesRegister);

export function fetchCoursesAction(teacherId: string, structureId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await coursesService.get(teacherId, structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchCoursesRegisterAction(course_data) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActionsRegister.request());
      const data = await coursesRegisterService.get(course_data);
      dispatch(dataActionsRegister.receipt(data));
    } catch (errmsg) {
      dispatch(dataActionsRegister.error(errmsg));
    }
  };
}
