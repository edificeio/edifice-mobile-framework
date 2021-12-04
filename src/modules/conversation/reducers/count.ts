import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/conversation/state/count';

export default createSessionAsyncReducer(initialState, actionTypes);
