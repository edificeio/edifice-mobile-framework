import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/presences/state/multipleSlots';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
