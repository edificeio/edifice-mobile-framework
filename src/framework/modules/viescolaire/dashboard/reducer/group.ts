import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/group';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
