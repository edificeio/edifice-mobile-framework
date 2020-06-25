import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { mailListService } from "../service/mailList";
import { actionTypes, IMailList } from "../state/mailList";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMailList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailListAction() {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const availableApps = getState().user.auth.apps;
      const data = await mailListService.get(availableApps);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
