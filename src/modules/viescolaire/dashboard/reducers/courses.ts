import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/dashboard/state/courses';

export default createSessionAsyncReducer(initialState, actionTypes);
