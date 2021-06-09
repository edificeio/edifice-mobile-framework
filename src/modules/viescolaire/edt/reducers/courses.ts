import { createSessionAsyncReducer } from "../../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/courses";

export default createSessionAsyncReducer(initialState, actionTypes);
