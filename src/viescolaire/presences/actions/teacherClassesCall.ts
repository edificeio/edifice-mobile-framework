import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { classesCallService } from "../services/teacherClassesCall";
import { IClassesCall, actionTypes } from "../state/teacherClassesCall";

export const dataActions = createAsyncActionCreators<IClassesCall>(actionTypes);

export function fetchClassesCallAction(callId) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const data = await classesCallService.get(callId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
