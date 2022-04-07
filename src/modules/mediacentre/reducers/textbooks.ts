import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/mediacentre/state/textbooks';

export default createSessionAsyncReducer(initialState, actionTypes);
