import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { periodsListService } from "../services/periods";
import { IPeriodsList, actionTypes } from "../state/periods";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IPeriodsList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchPeriodsListAction(structureId: string, groupId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await periodsListService.get(structureId, groupId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
