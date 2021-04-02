import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { moyenneListService } from "../services/moyennes";
import { actionTypes, IMoyenneList } from "../state/moyennes";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMoyenneList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchDevoirMoyennesListAction(structureId: string, studentId: string, periodId?: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await moyenneListService.get(structureId, studentId, periodId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
