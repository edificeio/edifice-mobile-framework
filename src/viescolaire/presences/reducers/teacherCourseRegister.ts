import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialStateRegister, actionTypes } from "../state/teacherCourseRegister";

export default createSessionAsyncReducer(initialStateRegister, actionTypes);
