import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/mailContent";

export default createSessionAsyncReducer(initialState, actionTypes);
