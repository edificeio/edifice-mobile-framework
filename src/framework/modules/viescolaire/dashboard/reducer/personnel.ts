import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/personnel';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
