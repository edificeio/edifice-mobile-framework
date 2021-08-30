// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { formatResults, IBackendFolder } from "./helpers/documents";
import { IGlobalState } from "../../AppStore";
import workspaceService from "../../framework/modules/workspace/service";
import { getUserSession } from "../../framework/util/session";
// import { Trackers } from "../../infra/tracker";
import { listAction } from "../actions/list";
import { ThunkDispatch } from "redux-thunk";
import { FilterId } from "../types";

const WORKSPACE_FOLDER = "/workspace/folder";

export const actionTypesCreateFolder = asyncActionTypes(config.createActionType(`${WORKSPACE_FOLDER}/create`));

/**
 * request format: formaData
 *                              name: fff
 *
 * response format: {"name":"fff","application":"media-library","shared":[],""_id: ....}
 */
export function createFolderAction(name: string, parentId?: string) {
    //   Trackers.trackEvent("Workspace", "CREATE", "Folder");
    return async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
        const payload = parentId === FilterId.owner ? { name, parentId } : { name, parentId, parentFolderId: parentId };
        try {
            dispatch({ type: actionTypesCreateFolder.requested, payload });
            const session = getUserSession(getState());
            const res = workspaceService.createFolder(session, name, parentId);
            const resAdapted = formatResults(res as unknown as IBackendFolder, parentId);
            const ret = dispatch({ type: actionTypesCreateFolder.received, resAdapted, receivedAt: Date.now(), payload });
            dispatch(listAction(parentId ? { parentId } : { filter: FilterId.owner, parentId: FilterId.owner }));
            return ret;
        } catch (e) {
            console.warn(e);
            return dispatch({ type: actionTypesCreateFolder.fetchError, e, payload });
        }
    }

    //   return asyncActionFactory(
    //     WORKSPACE_FOLDER,
    //     parentId === "owner" ? { name, parentId } : { name, parentId, parentFolderId: parentId },
    //     actionTypesCreateFolder,
    //     formatResults,
    //     { method: "post", formData: true }
    //   );
}
