import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/mediacentre/state/search';

export default createSessionAsyncReducer(initialState, actionTypes);
