import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/cdt/state/timeSlots';

export default createSessionAsyncReducer(initialState, actionTypes);
