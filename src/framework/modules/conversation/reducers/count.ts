import { actionTypes, initialState } from '~/framework/modules/conversation/state/count';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

export default createSessionAsyncReducer(initialState, actionTypes);
