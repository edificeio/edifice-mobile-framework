/**
 * Workspace actions
 */
import { ThunkAction } from 'redux-thunk';

import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { IFile, actionTypes } from '~/modules/workspace/reducer';
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

/**
 * Copy files with given ids to specified directory.
 */
export const workspaceCopyActionsCreators = createAsyncActionCreators(actionTypes.copy);
export const copyWorkspaceFilesAction =
  (parentId: string, selectedFiles: string[], destinationId: string) => async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(workspaceCopyActionsCreators.request());
      await workspaceService.files.copy(session, parentId, selectedFiles, destinationId);
      dispatch(workspaceCopyActionsCreators.receipt(selectedFiles.length));
    } catch (e) {
      dispatch(workspaceCopyActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Move files with given ids to specified directory.
 */
export const workspaceMoveActionsCreators = createAsyncActionCreators(actionTypes.move);
export const moveWorkspaceFilesAction =
  (parentId: string, selectedFiles: string[], destinationId: string) => async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(workspaceMoveActionsCreators.request());
      await workspaceService.files.move(session, parentId, selectedFiles, destinationId);
      dispatch(workspaceMoveActionsCreators.receipt(selectedFiles.length));
    } catch (e) {
      dispatch(workspaceMoveActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Restore files with given ids.
 */
export const workspaceRestoreActionsCreators = createAsyncActionCreators(actionTypes.restore);
export const restoreWorkspaceFilesAction = (parentId: string, selectedFiles: string[]) => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(workspaceRestoreActionsCreators.request());
    await workspaceService.files.restore(session, parentId, selectedFiles);
    dispatch(workspaceRestoreActionsCreators.receipt(selectedFiles.length));
  } catch (e) {
    dispatch(workspaceRestoreActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Trash files with given ids.
 */
export const workspaceTrashActionsCreators = createAsyncActionCreators(actionTypes.trash);
export const trashWorkspaceFilesAction = (parentId: string, selectedFiles: string[]) => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(workspaceTrashActionsCreators.request());
    await workspaceService.files.trash(session, parentId, selectedFiles);
    dispatch(workspaceTrashActionsCreators.receipt(selectedFiles.length));
  } catch (e) {
    dispatch(workspaceTrashActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Delete files with given ids.
 */
export const workspaceDeleteActionsCreators = createAsyncActionCreators(actionTypes.delete);
export const deleteWorkspaceFilesAction = (parentId: string, selectedFiles: string[]) => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(workspaceDeleteActionsCreators.request());
    await workspaceService.files.delete(session, parentId, selectedFiles);
    dispatch(workspaceDeleteActionsCreators.receipt(selectedFiles.length));
  } catch (e) {
    dispatch(workspaceDeleteActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Rename a file.
 */
export const workspaceRenameActionsCreators = createAsyncActionCreators(actionTypes.rename);
export const renameWorkspaceFileAction = (parentId: string, file: IFile, name: string) => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(workspaceRenameActionsCreators.request());
    if (file.isFolder) {
      await workspaceService.folder.rename(session, parentId, file.id, name);
    } else {
      await workspaceService.file.rename(session, parentId, file.id, name);
    }
    dispatch(workspaceRenameActionsCreators.receipt(name));
  } catch (e) {
    dispatch(workspaceRenameActionsCreators.error(e as Error));
    throw e;
  }
};
