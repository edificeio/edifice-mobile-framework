/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../../infra/redux/async2";
import { devoirListService } from "../services/devoirs";
import { actionTypes, IDevoirList } from "../state/devoirs";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IDevoirList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchDevoirListAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await devoirListService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
