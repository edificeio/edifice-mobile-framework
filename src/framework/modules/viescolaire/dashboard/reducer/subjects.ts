import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/subjects';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
