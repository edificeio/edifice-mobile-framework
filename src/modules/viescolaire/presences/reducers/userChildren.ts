import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/presences/state/userChildren';

export default createSessionAsyncReducer(initialState, actionTypes);
