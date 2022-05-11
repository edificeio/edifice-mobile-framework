import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/viesco/state/childrenGroups';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
