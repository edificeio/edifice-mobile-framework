import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { Trackers } from "../../infra/tracker";
import { foldersService } from "../service/folders";
import { ICount, actionTypes } from "../state/count";

export const dataActions = createAsyncActionCreators<ICount>(actionTypes);

export function fetchCountAction(folderIds: string[]) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "FETCH COUNT");
    try {
      dispatch(dataActions.request());
      const data = await foldersService.count(folderIds);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
