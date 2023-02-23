import { actionTypes, initialState } from '~/framework/modules/conversation/state/visibles';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';

export default createSessionAsyncReducer(initialState, actionTypes);
