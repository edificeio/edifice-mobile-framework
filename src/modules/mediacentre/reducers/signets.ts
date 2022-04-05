import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/mediacentre/state/signets';

export default createSessionAsyncReducer(initialState, actionTypes);
