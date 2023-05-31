import { actionTypes, initialState } from '~/framework/modules/conversation/state/mailContent';
import { createSessionAsyncReducer } from '~/infra/redux/async2';

export default createSessionAsyncReducer(initialState, actionTypes);
