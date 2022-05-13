import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/viesco/state/courses';

export default createSessionAsyncReducer(initialState, actionTypes);
