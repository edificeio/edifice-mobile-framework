import { initialState, selectStructureActionType } from '~/framework/modules/viescolaire/dashboard/state/structure';
import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { actionTypeLoggedIn } from '~/user/actions/actionTypes/login';

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    selectedStructure: action.userbook.structures ? action.userbook.structures[0] : null,
  }),
  [selectStructureActionType]: (state, action) => ({
    selectedStructure: action.selectedStructure,
  }),
});
