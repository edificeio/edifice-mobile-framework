import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { periodsInitialState, periodsActionTypes, yearActionTypes, yearInitialState } from "../state/periods";

// THE REDUCER ------------------------------------------------------------------------------------

export const periods = createSessionAsyncReducer(periodsInitialState, periodsActionTypes);
export const year = createSessionAsyncReducer(yearInitialState, yearActionTypes);
