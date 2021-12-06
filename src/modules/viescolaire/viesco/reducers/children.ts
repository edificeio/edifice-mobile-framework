import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { selectChildActionType, initialState } from '~/modules/viescolaire/viesco/state/children';
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
