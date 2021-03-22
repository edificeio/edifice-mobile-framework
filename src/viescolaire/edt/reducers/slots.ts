import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/slots";

export default createSessionAsyncReducer(initialState, actionTypes);
