import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/viesco/state/group';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
