import { createSessionAsyncReducer } from "../../../../infra/redux/async2";
import { actionTypes as registerActionTypes } from "../state/teacherCourseRegister";
import { initialState, actionTypes } from "../state/teacherCourses";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [actionTypes.receipt]: (data, action) => action.data.sort((a, b) => a.startDate - b.startDate),
  [registerActionTypes.receipt]: (state, action) =>
    state.map(course => {
      if (course.id !== action.data.course_id) return course;
      else return { ...course, registerId: action.data.id };
    }),
});
