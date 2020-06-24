import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/teacherClassesCall";

export default createSessionAsyncReducer(initialState, actionTypes);
