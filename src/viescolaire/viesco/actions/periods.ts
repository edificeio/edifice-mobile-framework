import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { periodsListService } from "../services/periods";
import { IPeriodsList, periodsActionTypes, yearActionTypes, IYear } from "../state/periods";

// ACTION LIST ------------------------------------------------------------------------------------

export const periodsDataActions = createAsyncActionCreators<IPeriodsList>(periodsActionTypes);
export const yearDataActions = createAsyncActionCreators<IYear>(yearActionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchPeriodsListAction(structureId: string, groupId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(periodsDataActions.request());
      const data = await periodsListService.getPeriods(structureId, groupId);
      dispatch(periodsDataActions.receipt(data));
    } catch (errmsg) {
      dispatch(periodsDataActions.error(errmsg));
    }
  };
}

export function fetchYearAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(yearDataActions.request());
      const data = await periodsListService.getYear(structureId);
      dispatch(yearDataActions.receipt(data));
    } catch (errmsg) {
      dispatch(yearDataActions.error(errmsg));
    }
  };
}
