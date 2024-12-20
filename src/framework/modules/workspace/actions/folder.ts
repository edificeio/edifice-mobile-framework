import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { assertSession } from '~/framework/modules/auth/reducer';
import { actionTypes, IFolder } from '~/framework/modules/workspace/reducer';
import workspaceService from '~/framework/modules/workspace/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the owner folders.
 */
export const workspaceListFoldersActionsCreators = createAsyncActionCreators(actionTypes.listFolders);
export const listWorkspaceFoldersAction = () => async (dispatch, getState) => {
  try {
    const folders: IFolder[] = [
      {
        children: [],
        id: 'owner',
        name: I18n.get('workspace-filelist-owner'),
        parentId: '0',
        sortNo: 'owner',
      },
    ];
    const session = assertSession();
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
    const session = assertSession();
    const folder = await workspaceService.folder.create(session, name, parentId);
    dispatch(workspaceCreateFolderActionsCreators.receipt(folder));
    Toast.showSuccess(I18n.get('workspace-filelist-folder-foldercreated'));
    return folder;
  } catch (e) {
    dispatch(workspaceCreateFolderActionsCreators.error(e as Error));
    throw e;
  }
};
