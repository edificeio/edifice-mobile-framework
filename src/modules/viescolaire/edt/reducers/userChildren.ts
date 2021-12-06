import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/edt/state/userChildren';

export default createSessionAsyncReducer(initialState, actionTypes);
