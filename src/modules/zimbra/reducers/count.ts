import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/zimbra/state/count';

export default createSessionAsyncReducer(initialState, actionTypes);
