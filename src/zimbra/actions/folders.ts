import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { foldersService } from "../service/folders";
import { actionTypes, IFolderList, postFolderType } from "../state/folders";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IFolderList>(actionTypes);
export const folderActions = {
  post: data => ({ type: postFolderType, data }),
};

// THUNKS -----------------------------------------------------------------------------------------

export function fetchFoldersAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await foldersService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function postFolderAction(name: string, parentId: string) {
  return async (dispatch: Dispatch) => {
    try {
      const folder = await foldersService.post(name, parentId);
      dispatch(folderActions.post(folder));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
