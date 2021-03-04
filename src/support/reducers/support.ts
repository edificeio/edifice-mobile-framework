import { createSessionAsyncReducer } from "../../infra/redux/async2";
import { initialState, actionTypes } from "../state/support";

export default createSessionAsyncReducer(initialState, actionTypes);
