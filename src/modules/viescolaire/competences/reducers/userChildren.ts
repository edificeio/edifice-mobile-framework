import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/competences/state/userChildren';

export default createSessionAsyncReducer(initialState, actionTypes);
