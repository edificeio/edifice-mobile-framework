import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/edt/state/userChildren';

export default createSessionAsyncReducer(initialState, actionTypes);
