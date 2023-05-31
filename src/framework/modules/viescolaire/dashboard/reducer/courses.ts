import { actionTypes, initialState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';

export default createSessionAsyncReducer(initialState, actionTypes);
