import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { initialState, selectStructureActionType } from '~/modules/viescolaire/dashboard/state/structure';
import { actionTypeLoggedIn } from '~/user/actions/actionTypes/login';

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    selectedStructure: action.userbook.structures ? action.userbook.structures[0] : null,
  }),
  [selectStructureActionType]: (state, action) => ({
    selectedStructure: action.selectedStructure,
  }),
});
