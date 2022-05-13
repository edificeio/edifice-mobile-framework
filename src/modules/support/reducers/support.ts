import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/support/state/support';

export default createSessionAsyncReducer(initialState, actionTypes);
