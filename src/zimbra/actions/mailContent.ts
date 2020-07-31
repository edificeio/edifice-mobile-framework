import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { mailContentService } from "../service/mailContent";
import { actionTypes, IMail } from "../state/mailContent";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMail>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailContentAction(mailId) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const data = await mailContentService.get(mailId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
