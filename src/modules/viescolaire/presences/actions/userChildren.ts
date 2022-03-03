import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { userChildrenService } from '~/modules/viescolaire/presences/services/userChildren';
import { IUserChildren, actionTypes } from '~/modules/viescolaire/presences/state/userChildren';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IUserChildren>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchUserChildrenAction(relativeId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await userChildrenService.get(relativeId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
