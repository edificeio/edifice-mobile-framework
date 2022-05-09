import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/cdt/state/timeSlots';

export default createSessionAsyncReducer(initialState, actionTypes);
