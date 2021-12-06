import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/edt/state/courses';

export default createSessionAsyncReducer(initialState, actionTypes);
