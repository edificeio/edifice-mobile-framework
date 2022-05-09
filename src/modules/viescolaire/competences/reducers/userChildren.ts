import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/competences/state/userChildren';

export default createSessionAsyncReducer(initialState, actionTypes);
