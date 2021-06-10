import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../../infra/redux/async2";
import { slotsService } from "../services/slots";
import { ISlotList, actionTypes } from "../state/slots";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ISlotList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchSlotListAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await slotsService.getStructureSlots(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
