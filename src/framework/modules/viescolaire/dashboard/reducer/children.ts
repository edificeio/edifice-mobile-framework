import { actionTypes } from '~/framework/modules/auth/reducer';
import { initialState, selectChildActionType } from '~/framework/modules/viescolaire/dashboard/state/children';
import { createSessionReducer } from '~/infra/redux/reducerFactory';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionReducer(initialState, {
  [actionTypes.sessionCreate]: (state, action) => ({
    selectedChild: action.session.user.children[0]?.children[0]?.id,
  }),
  [selectChildActionType]: (state, action) => ({
    selectedChild: action.selectedChild,
  }),
});
