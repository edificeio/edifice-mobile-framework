// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResults } from "./helpers/documents";
import { Trackers } from "../../infra/tracker";

const WORKSPACE_FOLDER = "/workspace/folder";

export const actionTypesCreateFolder = asyncActionTypes(config.createActionType(`${WORKSPACE_FOLDER}/create`));

/**
 * request format: formaData
 *                              name: fff
 *
 * response format: {"name":"fff","application":"media-library","shared":[],""_id: ....}
 */
export function createFolderAction(parentId, name) {
  Trackers.trackEvent("Workspace", "CREATE", "Folder");
  return asyncActionFactory(
    WORKSPACE_FOLDER,
    parentId === "owner" ? { name, parentId } : { name, parentId, parentFolderId: parentId },
    actionTypesCreateFolder,
    formatResults,
    { method: "post", formData: true }
  );
}
