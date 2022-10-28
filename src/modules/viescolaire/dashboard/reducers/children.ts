import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { initialState, selectChildActionType } from '~/modules/viescolaire/dashboard/state/children';
import { actionTypeLoggedIn } from '~/user/actions/actionTypes/login';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    selectedChild: action.userbook.children ? action.userbook.childrenIds[0] : null,
  }),
  [selectChildActionType]: (state, action) => ({
    selectedChild: action.selectedChild,
  }),
});
