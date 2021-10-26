import { createSessionAsyncReducer } from "../../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/multipleSlots";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
