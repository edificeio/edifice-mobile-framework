import {
  periodsActionTypes,
  periodsInitialState,
  yearActionTypes,
  yearInitialState,
} from '~/framework/modules/viescolaire/dashboard/state/periods';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

// THE REDUCER ------------------------------------------------------------------------------------

export const periods = createSessionAsyncReducer(periodsInitialState, periodsActionTypes);
export const year = createSessionAsyncReducer(yearInitialState, yearActionTypes);
