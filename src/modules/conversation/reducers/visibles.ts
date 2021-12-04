import { createSessionAsyncReducer } from '~/framework/util/redux/async';
import { initialState, actionTypes } from '~/modules/conversation/state/visibles';

export default createSessionAsyncReducer(initialState, actionTypes);
