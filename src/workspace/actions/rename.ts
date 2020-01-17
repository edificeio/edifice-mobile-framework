// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResult } from "./helpers/folders";

const WORKSPACE_RENAME = "/workspace/document/rename";
const WORKSPACE_FOLDER_RENAME = "/workspace/folder/rename";
const WORKSPACE_FILE_RENAME = "/workspace/file/rename";

export const actionTypesRename = asyncActionTypes(config.createActionType(`${WORKSPACE_RENAME}`));

/**
 * Rename document.
 * Dispatches WORKSPACE_RENAME_REQUESTED, WORKSPACE_RENAME_RECEIVED, and WORKSPACE_RENAME_FETCH_ERROR if an error occurs.
 */
export function renameAction(name, item, parentId) {
  const url = item.isFolder ? `${WORKSPACE_FOLDER_RENAME}/${item.id}` : `${WORKSPACE_FILE_RENAME}/${item.id}`;

  return asyncActionFactory(url, { name, id: parentId }, actionTypesRename, { post: true }, formatResult);
}
