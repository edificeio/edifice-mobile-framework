// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResult } from "./helpers/folders";

const WORKSPACE_FOLDER = "/workspace/folder";

export const actionTypesCreateFolder = asyncActionTypes(config.createActionType(`${WORKSPACE_FOLDER}/create`));

/**
 * Get workspace folder from the backend.
 * Dispatches WORKSPACE_FOLDER_REQUESTED, WORKSPACE_FOLDER_RECEIVED, and WORKSPACE_FOLDER_FETCH_ERROR if an error occurs.
 */
export function createFolderAction(name, id) {
  return asyncActionFactory(
    WORKSPACE_FOLDER,
    id === "owner" ? { name, id } : { name, parentFolderId: id, id },
    actionTypesCreateFolder,
    { post: true, formData: true },
    formatResult
  );
}
