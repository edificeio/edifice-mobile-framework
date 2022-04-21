import { ThunkDispatch } from 'redux-thunk';

import workspaceService from '~/framework/modules/workspace/service';
import { getUserSession } from '~/framework/util/session';

export const createFolderAction =
  (name: string, parentFolderId?: string) => (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = getUserSession();
    return workspaceService.createFolder(session, name, parentFolderId);
  };
