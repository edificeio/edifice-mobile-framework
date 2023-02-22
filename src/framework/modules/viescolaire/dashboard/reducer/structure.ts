import { actionTypes } from '~/framework/modules/auth/reducer';
import { initialState, selectStructureActionType } from '~/framework/modules/viescolaire/dashboard/state/structure';
import { createSessionReducer } from '~/infra/redux/reducerFactory';

export default createSessionReducer(initialState, {
  [actionTypes.sessionCreate]: (state, action) => ({
    selectedStructure: action.session.user.structures[0]?.id,
  }),
  [selectStructureActionType]: (state, action) => ({
    selectedStructure: action.selectedStructure,
  }),
});
