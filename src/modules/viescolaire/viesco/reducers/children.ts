import { createSessionReducer } from "../../../../infra/redux/reducerFactory";
import { actionTypeLoggedIn } from "../../../../user/actions/actionTypes/login";
import { selectChildActionType, initialState } from "../state/children";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    selectedChild: action.userbook.children ? action.userbook.childrenIds[0] : null,
  }),
  [selectChildActionType]: (state, action) => ({
    selectedChild: action.selectedChild,
  }),
});
