/**
 * Workspace actions
 */
import { ThunkAction } from 'redux-thunk';

import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { IFile, actionTypes } from '~/modules/workspace/reducers';
import { workspaceService } from '~/modules/workspace/service';
import { Filter } from '~/modules/workspace/types';

/**
 * Fetch the files of a given directory.
 */
export const workspaceDirectoriesActionsCreators = createAsyncActionCreators(actionTypes.directories);
export const fetchWorkspaceFilesAction =
  (filter: Filter, parentId: string): ThunkAction<Promise<IFile[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      const state = getState();
      dispatch(workspaceDirectoriesActionsCreators.request());
      const files = await workspaceService.files.get(session, filter, parentId);
      dispatch(workspaceDirectoriesActionsCreators.receipt({ ...state.workspace2.directories.data, [parentId]: files }));
      return files;
    } catch (e) {
      dispatch(workspaceDirectoriesActionsCreators.error(e as Error));
      throw e;
    }
  };
