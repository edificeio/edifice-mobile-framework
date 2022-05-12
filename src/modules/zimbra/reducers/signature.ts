import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/zimbra/state/signature';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
