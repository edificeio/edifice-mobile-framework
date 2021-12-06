import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/support/state/support';

export default createSessionAsyncReducer(initialState, actionTypes);
