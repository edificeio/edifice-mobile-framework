import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import workspaceService from '~/framework/modules/workspace/service';
import { getUserSession } from '~/framework/util/session';
import { asyncActionTypes } from '~/infra/redux/async';
import { listAction } from '~/modules/workspace/actions/list';
import { Filter } from '~/modules/workspace/types';

import { IBackendFolder, formatResults } from './helpers/documents';

export const actionTypesCreateFolder = asyncActionTypes('WORKSPACE_FOLDER');

/**
 * request format: formaData
 *                              name: fff
 *
 * response format: {"name":"fff","application":"media-library","shared":[],""_id: ....}
 */
export function createFolderAction(name: string, parentId?: string) {
  //   Trackers.trackEvent("Workspace", "CREATE", "Folder");
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
    const payload = parentId === Filter.OWNER ? { name, parentId } : { name, parentId, parentFolderId: parentId };
    try {
      dispatch({ type: actionTypesCreateFolder.requested, payload });
      const session = getUserSession();
      const res = workspaceService.createFolder(session, name, parentId);
      const resAdapted = formatResults(res as unknown as IBackendFolder, parentId);
      const ret = dispatch({ type: actionTypesCreateFolder.received, resAdapted, receivedAt: Date.now(), payload });
      dispatch(listAction(parentId ? { parentId } : { filter: Filter.OWNER, parentId: Filter.OWNER }));
      return ret;
    } catch (e) {
      return dispatch({ type: actionTypesCreateFolder.fetchError, e, payload });
    }
  };
}
