/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { homeworkListService } from "../services/homeworks";
import { actionTypes, IHomeworkList } from "../state/homeworks";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IHomeworkList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchHomeworkListAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await homeworkListService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
