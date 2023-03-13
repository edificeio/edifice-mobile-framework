import I18n from 'i18n-js';
import { Platform } from 'react-native';
import Share from 'react-native-share';
import Toast from 'react-native-tiny-toast';
import type { NavigationInjectedProps } from 'react-navigation';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { assertSession } from '~/framework/modules/auth/reducer';
import { Filter, IFile, actionTypes } from '~/framework/modules/workspace/reducer';
import workspaceService, { IWorkspaceUploadParams, factoryRootFolder } from '~/framework/modules/workspace/service';
import { IDistantFile, LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import { openDocument } from '~/framework/util/fileHandler/actions';
import type { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import fileTransferService from '~/framework/util/fileHandler/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { urlSigner } from '~/infra/oauth';

/**
 * Take a file from the mobile and post it to the backend.
 */
export const workspaceUploadActionsCreators = createAsyncActionCreators(actionTypes.upload);
export const uploadWorkspaceFileAction = (parentId: string, lf: LocalFile) => async (dispatch, getState) => {
  try {
    dispatch(workspaceUploadActionsCreators.request());
    const file = await workspaceService.file.uploadFile(assertSession(), lf, {
      parent: parentId as IWorkspaceUploadParams['parent'],
    });
    dispatch(workspaceUploadActionsCreators.receipt(file));
    Toast.showSuccess(I18n.t('workspace.file-added'), { ...UI_ANIMATIONS.toast });
  } catch (e: any) {
    if (e && e?.response && e.response.body === `{"error":"file.too.large"}`) {
      Toast.show(I18n.t('fullStorage'), { ...UI_ANIMATIONS.toast });
    }
    dispatch(workspaceUploadActionsCreators.error(e as Error));
  }
};

/**
 * Fetch the files of a given directory.
 */
export const workspaceDirectoriesActionsCreators = createAsyncActionCreators(actionTypes.directories);
export const fetchWorkspaceFilesAction =
  (filter: Filter, parentId: string): ThunkAction<Promise<IFile[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      const state = getState();
      dispatch(workspaceDirectoriesActionsCreators.request());
      let files: IFile[];
      if (filter === Filter.ROOT) {
        files = [
          factoryRootFolder(Filter.OWNER),
          factoryRootFolder(Filter.PROTECTED),
          factoryRootFolder(Filter.SHARED),
          factoryRootFolder(Filter.TRASH),
        ];
      } else {
        files = await workspaceService.files.get(session, filter, parentId);
      }
      dispatch(workspaceDirectoriesActionsCreators.receipt({ ...state.workspace.directories.data, [parentId]: files }));
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
  (parentId: string, files: string[], destinationId: string) => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(workspaceCopyActionsCreators.request());
      await workspaceService.files.copy(session, parentId, files, destinationId);
      dispatch(workspaceCopyActionsCreators.receipt(files.length));
      Toast.showSuccess(I18n.t('workspace.successfully-copied'), { ...UI_ANIMATIONS.toast });
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
  (parentId: string, files: string[], destinationId: string) => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(workspaceMoveActionsCreators.request());
      await workspaceService.files.move(session, parentId, files, destinationId);
      dispatch(workspaceMoveActionsCreators.receipt(files.length));
      Toast.showSuccess(I18n.t('workspace.successfully-moved'), { ...UI_ANIMATIONS.toast });
    } catch (e) {
      dispatch(workspaceMoveActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Restore files with given ids.
 */
export const workspaceRestoreActionsCreators = createAsyncActionCreators(actionTypes.restore);
export const restoreWorkspaceFilesAction = (parentId: string, files: string[]) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(workspaceRestoreActionsCreators.request());
    await workspaceService.files.restore(session, parentId, files);
    dispatch(workspaceRestoreActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-restored'), { ...UI_ANIMATIONS.toast });
  } catch (e) {
    dispatch(workspaceRestoreActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Trash files with given ids.
 */
export const workspaceTrashActionsCreators = createAsyncActionCreators(actionTypes.trash);
export const trashWorkspaceFilesAction = (parentId: string, files: string[]) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(workspaceTrashActionsCreators.request());
    await workspaceService.files.trash(session, parentId, files);
    dispatch(workspaceTrashActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-deleted'), { ...UI_ANIMATIONS.toast });
  } catch (e) {
    dispatch(workspaceTrashActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Delete files with given ids.
 */
export const workspaceDeleteActionsCreators = createAsyncActionCreators(actionTypes.delete);
export const deleteWorkspaceFilesAction = (parentId: string, files: string[]) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(workspaceDeleteActionsCreators.request());
    await workspaceService.files.delete(session, parentId, files);
    dispatch(workspaceDeleteActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-deleted'), { ...UI_ANIMATIONS.toast });
  } catch (e) {
    dispatch(workspaceDeleteActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Rename a file.
 */
export const workspaceRenameActionsCreators = createAsyncActionCreators(actionTypes.rename);
export const renameWorkspaceFileAction = (file: IFile, name: string) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(workspaceRenameActionsCreators.request());
    if (file.isFolder) {
      await workspaceService.folder.rename(session, file.id, name);
    } else {
      await workspaceService.file.rename(session, file.id, name);
    }
    dispatch(workspaceRenameActionsCreators.receipt(name));
    Toast.showSuccess(I18n.t('workspace.successfully-edited'), { ...UI_ANIMATIONS.toast });
  } catch (e) {
    dispatch(workspaceRenameActionsCreators.error(e as Error));
    throw e;
  }
};

export const convertIFileToIDistantFile = (file: IFile) => {
  return {
    url: urlSigner.getAbsoluteUrl(file.url),
    filename: file.name,
    filesize: file.size,
    filetype: file.contentType,
  } as IDistantFile;
};

/**
 * Download and open the given file.
 */
export const workspacePreviewActionsCreators = createAsyncActionCreators(actionTypes.preview);
export const downloadThenOpenWorkspaceFileAction =
  (file: IFile, navigation: NavigationInjectedProps['navigation']) => async (dispatch, getState) => {
    try {
      dispatch(workspacePreviewActionsCreators.request());
      const distanteFile = convertIFileToIDistantFile(file);
      const resultingFile = await openDocument(distanteFile, navigation);
      dispatch(workspacePreviewActionsCreators.receipt(resultingFile));
    } catch (e) {
      dispatch(workspacePreviewActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Download and share the given file.
 */
export const workspaceShareActionsCreators = createAsyncActionCreators(actionTypes.share);
export const downloadThenShareWorkspaceFileAction = (file: IFile) => async (dispatch, getState) => {
  try {
    dispatch(workspaceShareActionsCreators.request());
    const session = assertSession();
    const distanteFile = convertIFileToIDistantFile(file);
    const syncedFile = await fileTransferService.downloadFile(session, distanteFile, {});
    await Share.open({
      type: syncedFile.filetype || 'text/html',
      url: Platform.OS === 'android' ? 'file://' + syncedFile.filepath : syncedFile.filepath,
      showAppsToView: true,
    });
    dispatch(workspaceShareActionsCreators.receipt(syncedFile));
  } catch (e) {
    dispatch(workspaceShareActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Download and save the given files.
 */
export const workspaceDownloadActionsCreators = createAsyncActionCreators(actionTypes.download);
export const downloadWorkspaceFilesAction = (files: IFile[]) => async (dispatch, getState) => {
  try {
    dispatch(workspaceDownloadActionsCreators.request());
    const syncedFiles: SyncedFile[] = [];
    const session = assertSession();
    for (const file of files) {
      const distanteFile = convertIFileToIDistantFile(file);
      const syncedFile = await fileTransferService.downloadFile(session, distanteFile, {});
      await syncedFile.mirrorToDownloadFolder();
      syncedFiles.push(syncedFile);
    }
    dispatch(workspaceDownloadActionsCreators.receipt(syncedFiles));
    Toast.showSuccess(
      files.length > 1 ? I18n.t('download-success-all') : I18n.t('download-success-name', { name: files[0].name }),
      { ...UI_ANIMATIONS.toast },
    );
  } catch (e) {
    dispatch(workspaceDownloadActionsCreators.error(e as Error));
    throw e;
  }
};

export default {
  uploadFilesAction:
    (files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const session = assertSession();
      return workspaceService.files.uploadFiles(session, files, params, callbacks);
    },
};
