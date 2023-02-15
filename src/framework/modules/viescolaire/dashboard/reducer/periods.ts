import {
  periodsActionTypes,
  periodsInitialState,
  yearActionTypes,
  yearInitialState,
} from '~/framework/modules/viescolaire/dashboard/state/periods';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';

// THE REDUCER ------------------------------------------------------------------------------------

export const periods = createSessionAsyncReducer(periodsInitialState, periodsActionTypes);
export const year = createSessionAsyncReducer(yearInitialState, yearActionTypes);
