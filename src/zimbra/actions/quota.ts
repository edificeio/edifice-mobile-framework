import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { Trackers } from "../../infra/tracker";
import { quotaService } from "../service/quota";
import { IQuota, actionTypes } from "../state/quota";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IQuota>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchQuotaAction() {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "GET QUOTA");
    try {
      dispatch(dataActions.request());
      const data = await quotaService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
