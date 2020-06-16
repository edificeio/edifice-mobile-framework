/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { homeworkListService, homeworkChildService, homeworkService } from "../services/homeworks";
import { listActionTypes, IHomeworkList, updateActionTypes } from "../state/homeworks";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IHomeworkList>(listActionTypes);
export const customActions = createAsyncActionCreators<{homeworkId: number, status: string}>(updateActionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchHomeworkListAction(structureId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await homeworkListService.get(structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchChildHomeworkAction(childId: string, structureId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await homeworkChildService.get(childId, structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function updateHomeworkProgressAction(homeworkId: number, isDone: boolean) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(customActions.request());
      const data = await homeworkService.post(homeworkId, isDone);
      dispatch(customActions.receipt(data));
    } catch (errmsg) {
      dispatch(customActions.error(errmsg));
    }
  };
}
