import { createSessionReducer } from "../../../../infra/redux/reducerFactory";
import { actionTypeLoggedIn } from "../../../../user/actions/actionTypes/login";
import { selectStructureActionType, initialState } from "../state/structure";

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    selectedStructure: action.userbook.structures ? action.userbook.structures[0] : null,
  }),
  [selectStructureActionType]: (state, action) => ({
    selectedStructure: action.selectedStructure,
  }),
});
