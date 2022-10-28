import { createSessionAsyncReducer } from '~/infra/redux/async2';
import {
  periodsActionTypes,
  periodsInitialState,
  yearActionTypes,
  yearInitialState,
} from '~/modules/viescolaire/dashboard/state/periods';

// THE REDUCER ------------------------------------------------------------------------------------

export const periods = createSessionAsyncReducer(periodsInitialState, periodsActionTypes);
export const year = createSessionAsyncReducer(yearInitialState, yearActionTypes);
