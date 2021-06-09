import { createSessionAsyncReducer } from "../../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/moyennes";

export default createSessionAsyncReducer(initialState, actionTypes);
