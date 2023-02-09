import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/childrenGroups';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
