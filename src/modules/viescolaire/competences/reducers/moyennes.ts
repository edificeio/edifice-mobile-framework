import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/competences/state/moyennes';

export default createSessionAsyncReducer(initialState, actionTypes);
