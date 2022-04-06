import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/mediacentre/state/garResources';

export default createSessionAsyncReducer(initialState, actionTypes);
