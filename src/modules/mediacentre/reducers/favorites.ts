import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/mediacentre/state/favorites';

export default createSessionAsyncReducer(initialState, actionTypes);
