import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { mailListService } from "../service/mailList";
import { actionTypes, IMailList } from "../state/mailList";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMailList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailListAction(page: number, folderName: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await mailListService.get(page, folderName);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchMailListFromFolderAction(folderLocation: string, page: number) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await mailListService.getFromFolder(folderLocation, page);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
