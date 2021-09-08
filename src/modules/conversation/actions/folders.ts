import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../infra/redux/async2";
import { Trackers } from "../../../infra/tracker";
import { foldersService } from "../service/folders";
import { actionTypes, IFolderList } from "../state/folders";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IFolderList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

// export function fetchFoldersAction() {
//   return async (dispatch: Dispatch) => {
//     try {
//       dispatch(dataActions.request());
//       const data = await foldersService.get();
//       dispatch(dataActions.receipt(data));
//     } catch (errmsg) {
//       dispatch(dataActions.error(errmsg));
//     }
//   };
// }

export function postFolderAction(name: string, parentId: string) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Conversation", "CREATE FOLDER");
    try {
      await foldersService.post(name, parentId);
      dispatch(dataActions.request());
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
