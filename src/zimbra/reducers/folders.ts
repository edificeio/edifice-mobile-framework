import { createSessionAsyncReducer } from "../../infra/redux/async2";
import { initialState, actionTypes } from "../state/folders";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
