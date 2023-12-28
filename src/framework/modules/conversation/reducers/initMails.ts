import { actionTypes, initialState } from '~/framework/modules/conversation/state/initMails';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
