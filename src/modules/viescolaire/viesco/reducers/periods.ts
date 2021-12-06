import { createSessionAsyncReducer } from '~/infra/redux/async2';
import {
  periodsInitialState,
  periodsActionTypes,
  yearActionTypes,
  yearInitialState,
} from '~/modules/viescolaire/viesco/state/periods';

// THE REDUCER ------------------------------------------------------------------------------------

export const periods = createSessionAsyncReducer(periodsInitialState, periodsActionTypes);
export const year = createSessionAsyncReducer(yearInitialState, yearActionTypes);
