import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/teacherCourses";

export default createSessionAsyncReducer(initialState, actionTypes);
