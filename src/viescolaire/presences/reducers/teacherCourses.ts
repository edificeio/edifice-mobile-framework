import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes, registerActionTypes } from "../state/teacherCourses";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [registerActionTypes.post]: (state, action) => {
    const i = state.findIndex(course => course.id === action.data.course_id);
    const obj = { ...state[i] };
    state[i] = Object.assign(obj, { registerId: action.data.id });
    return state;
  },
});
