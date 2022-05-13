import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialState } from '~/modules/viescolaire/competences/state/moyennes';

export default createSessionAsyncReducer(initialState, actionTypes);
