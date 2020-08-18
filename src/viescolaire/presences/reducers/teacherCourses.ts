import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { actionTypes as registerActionTypes } from "../state/teacherCourseRegister";
import { initialState, actionTypes } from "../state/teacherCourses";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [registerActionTypes.receipt]: (state, action) =>
    state.map(course => {
      if (course.id !== action.data.course_id) return course;
      else return { ...course, registerId: action.data.id };
    }),
});
