import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/mediacentre/state/externals';

export default createSessionAsyncReducer(initialState, actionTypes);
