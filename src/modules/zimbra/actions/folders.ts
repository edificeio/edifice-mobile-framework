import { Dispatch } from 'redux';

import { Trackers } from '~/framework/util/tracker';
import { createAsyncActionCreators } from '~/infra/redux/async2';
import { foldersService } from '~/modules/zimbra/service/folders';
import { IFolderList, actionTypes } from '~/modules/zimbra/state/folders';
import { IFolder } from '~/modules/zimbra/state/initMails';
import { actionTypesRootFolders } from '~/modules/zimbra/state/rootFolders';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IFolderList>(actionTypes);
export const dataActionsRootFolders = createAsyncActionCreators<IFolder[]>(actionTypesRootFolders);

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
    Trackers.trackEvent('Zimbra', 'CREATE FOLDER');
    try {
      await foldersService.post(name, parentId);
      dispatch(dataActions.request());
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchRootFoldersAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await foldersService.getRootFolders();
      dispatch(dataActionsRootFolders.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
