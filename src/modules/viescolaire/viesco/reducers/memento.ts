import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/viesco/state/memento';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
