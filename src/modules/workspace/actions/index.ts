/**
 * Workspace actions
 */
import I18n from 'i18n-js';
import { Platform } from 'react-native';
import Share from 'react-native-share';
import Toast from 'react-native-tiny-toast';
import { ThunkAction } from 'redux-thunk';

import uploadService, { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { IDistantFile, LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { Filter, IFile, IFolder, actionTypes } from '~/modules/workspace/reducer';
import { factoryRootFolder, workspaceService } from '~/modules/workspace/service';

/**
 * Take a file from the mobile and post it to the backend.
 */
export const workspaceUploadActionsCreators = createAsyncActionCreators(actionTypes.upload);
export const uploadWorkspaceFileAction = (parentId: string, lf: LocalFile) => async (dispatch, getState) => {
  try {
    dispatch(workspaceUploadActionsCreators.request());
    const file = await uploadService.startUploadFile(getUserSession(), lf, {
      parent: parentId as IWorkspaceUploadParams['parent'],
    });
    dispatch(workspaceUploadActionsCreators.receipt(file));
    Toast.showSuccess(I18n.t('workspace.file-added'));
  } catch (e) {
    if (e && e?.response && e.response.body === `{"error":"file.too.large"}`) {
      Toast.show(I18n.t('workspace.quota.overflowText'));
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
      const session = getUserSession();
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
 * Fetch the owner folders.
 */
export const workspaceListFoldersActionsCreators = createAsyncActionCreators(actionTypes.listFolders);
export const listWorkspaceFoldersAction = () => async (dispatch, getState) => {
  try {
    const folders: IFolder[] = [
      {
        id: 'owner',
        name: I18n.t('owner'),
        parentId: '0',
        sortNo: 'owner',
        children: [],
      },
    ];
    const session = getUserSession();
    dispatch(workspaceListFoldersActionsCreators.request());
    folders[0].children = await workspaceService.folders.list(session);
    dispatch(workspaceListFoldersActionsCreators.receipt(folders));
    return folders;
  } catch (e) {
    dispatch(workspaceListFoldersActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Create a new folder.
 */
export const workspaceCreateFolderActionsCreators = createAsyncActionCreators(actionTypes.createFolder);
export const createWorkspaceFolderAction = (name: string, parentId: string) => async (dispatch, getState) => {
  try {
    dispatch(workspaceCreateFolderActionsCreators.request());
    const session = getUserSession();
    const folder = await workspaceService.folder.create(session, name, parentId);
    dispatch(workspaceCreateFolderActionsCreators.receipt(folder));
    Toast.showSuccess(I18n.t('workspace.folder-created'));
    return folder;
  } catch (e) {
    dispatch(workspaceCreateFolderActionsCreators.error(e as Error));
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
      const session = getUserSession();
      dispatch(workspaceCopyActionsCreators.request());
      await workspaceService.files.copy(session, parentId, files, destinationId);
      dispatch(workspaceCopyActionsCreators.receipt(files.length));
      Toast.showSuccess(I18n.t('workspace.successfully-copied'));
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
      const session = getUserSession();
      dispatch(workspaceMoveActionsCreators.request());
      await workspaceService.files.move(session, parentId, files, destinationId);
      dispatch(workspaceMoveActionsCreators.receipt(files.length));
      Toast.showSuccess(I18n.t('workspace.successfully-moved'));
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
    const session = getUserSession();
    dispatch(workspaceRestoreActionsCreators.request());
    await workspaceService.files.restore(session, parentId, files);
    dispatch(workspaceRestoreActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-restored'));
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
    const session = getUserSession();
    dispatch(workspaceTrashActionsCreators.request());
    await workspaceService.files.trash(session, parentId, files);
    dispatch(workspaceTrashActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-deleted'));
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
    const session = getUserSession();
    dispatch(workspaceDeleteActionsCreators.request());
    await workspaceService.files.delete(session, parentId, files);
    dispatch(workspaceDeleteActionsCreators.receipt(files.length));
    Toast.showSuccess(I18n.t('workspace.successfully-deleted'));
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
    const session = getUserSession();
    dispatch(workspaceRenameActionsCreators.request());
    if (file.isFolder) {
      await workspaceService.folder.rename(session, file.id, name);
    } else {
      await workspaceService.file.rename(session, file.id, name);
    }
    dispatch(workspaceRenameActionsCreators.receipt(name));
    Toast.showSuccess(I18n.t('workspace.successfully-edited'));
  } catch (e) {
    dispatch(workspaceRenameActionsCreators.error(e as Error));
    throw e;
  }
};

const convertIFileToIDistantFile = (file: IFile) => {
  return {
    url: file.url,
    filename: file.name,
    filesize: file.size,
    filetype: file.contentType,
  } as IDistantFile;
};

/**
 * Download and open the given file.
 */
export const workspacePreviewActionsCreators = createAsyncActionCreators(actionTypes.preview);
export const downloadThenOpenWorkspaceFileAction = (file: IFile) => async (dispatch, getState) => {
  try {
    dispatch(workspacePreviewActionsCreators.request());
    const session = getUserSession();
    const distanteFile = convertIFileToIDistantFile(file);
    const syncedFile = await fileTransferService.downloadFile(session, distanteFile, {});
    syncedFile.open();
    dispatch(workspacePreviewActionsCreators.receipt(syncedFile));
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
    const session = getUserSession();
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
    const session = getUserSession();
    for (const file of files) {
      const distanteFile = convertIFileToIDistantFile(file);
      const syncedFile = await fileTransferService.downloadFile(session, distanteFile, {});
      await syncedFile.mirrorToDownloadFolder();
      syncedFiles.push(syncedFile);
    }
    dispatch(workspaceDownloadActionsCreators.receipt(syncedFiles));
    Toast.showSuccess(files.length > 1 ? I18n.t('download-success-all') : I18n.t('download-success-name', { name: files[0].name }));
  } catch (e) {
    dispatch(workspaceDownloadActionsCreators.error(e as Error));
    throw e;
  }
};
