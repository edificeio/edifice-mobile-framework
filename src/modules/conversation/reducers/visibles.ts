import { createSessionAsyncReducer } from "../../../framework/util/redux/async";
import { initialState, actionTypes } from "../state/visibles";

export default createSessionAsyncReducer(initialState, actionTypes);
