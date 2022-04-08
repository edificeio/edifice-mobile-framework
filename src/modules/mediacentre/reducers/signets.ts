import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/mediacentre/state/signets';

export default createSessionAsyncReducer(initialState, actionTypes);
