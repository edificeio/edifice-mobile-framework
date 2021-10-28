import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../../infra/redux/async2";
import { multipleSlotsService } from "../services/multipleSlots";
import { IMultipleSlots, actionTypes } from "../state/multipleSlots";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMultipleSlots>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMultipleSlotsAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await multipleSlotsService.get(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
