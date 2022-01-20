import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/viesco/state/courses';

export default createSessionAsyncReducer(initialState, actionTypes);
