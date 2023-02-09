import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/group';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
