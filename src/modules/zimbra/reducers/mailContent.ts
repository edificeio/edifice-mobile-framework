import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/zimbra/state/mailContent';

export default createSessionAsyncReducer(initialState, actionTypes);
