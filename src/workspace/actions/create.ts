// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResults } from "./helpers/documents";

const WORKSPACE_FOLDER = "/workspace/folder";

export const actionTypesCreateFolder = asyncActionTypes(config.createActionType(`${WORKSPACE_FOLDER}/create`));

/**
 * Create workspace folder to the backend.
 * Dispatches WORKSPACE_FOLDER_REQUESTED, WORKSPACE_FOLDER_RECEIVED, and WORKSPACE_FOLDER_FETCH_ERROR if an error occurs.
 */
export function createFolderAction(name, parentId) {
  return asyncActionFactory(
    WORKSPACE_FOLDER,
    parentId === "owner" ? { name, parentId } : { name, parentId, parentFolderId: parentId },
    actionTypesCreateFolder,
    formatResults,
    { method: "post", formData: true }
  );
}
