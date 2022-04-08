import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/mediacentre/state/garResources';

export default createSessionAsyncReducer(initialState, actionTypes);
