import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/edt/state/slots';

export default createSessionAsyncReducer(initialState, actionTypes);
