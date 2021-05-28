import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { userChildrenService } from "../services/userChildren";
import { IUserChildren, actionTypes } from "../state/userChildren";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IUserChildren>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchUserChildrenAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await userChildrenService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
