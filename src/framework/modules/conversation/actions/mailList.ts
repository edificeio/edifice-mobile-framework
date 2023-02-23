import { Dispatch } from 'redux';

import { mailListService } from '~/framework/modules/conversation/service/mailList';
import { IMailList, actionTypes } from '~/framework/modules/conversation/state/mailList';
import { createAsyncActionCreators } from '~/infra/redux/async2';

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

export function fetchMailListFromFolderAction(folderId: string, page: number) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await mailListService.getFromFolder(folderId, page);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
