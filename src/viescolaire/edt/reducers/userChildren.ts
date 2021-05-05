import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/userChildren";

export default createSessionAsyncReducer(initialState, actionTypes);
