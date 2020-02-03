/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResults } from "./helpers/formatListFolders";

// ACTION LIST ------------------------------------------------------------------------------------

const WORKSPACE_FOLDER = "/workspace/folders/list?filter=owner&hierarchical=true";

export const actionTypesFolder = asyncActionTypes(config.createActionType(WORKSPACE_FOLDER));

export function listFoldersAction() {
  return asyncActionFactory(WORKSPACE_FOLDER, { parentId: "owner" }, actionTypesFolder, formatResults, {
    method: "get",
  });
}
