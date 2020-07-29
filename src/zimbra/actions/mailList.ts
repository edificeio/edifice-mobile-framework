import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { mailListService } from "../service/mailList";
import { actionTypes, IMailList } from "../state/mailList";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMailList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailListAction(page) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const data = await mailListService.get(page);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
