import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

export default createSessionAsyncReducer(initialState, actionTypes);
