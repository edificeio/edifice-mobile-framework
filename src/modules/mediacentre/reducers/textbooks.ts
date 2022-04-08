import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/mediacentre/state/textbooks';

export default createSessionAsyncReducer(initialState, actionTypes);
