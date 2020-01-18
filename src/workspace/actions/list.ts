/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { IFiltersParameters } from "../types";
import { getFolders } from "./helpers/folders";
import { getDocuments } from "./helpers/documents";
import { asyncActionRawFactory } from "../../infra/actions/asyncActionFactory";

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypesList = asyncActionTypes(config.createActionType("/workspace/list"));

/**
 * Get workspace list from the backend.
 * Dispatches WORKSPACE_LIST_REQUESTED, WORKSPACE_LIST_RECEIVED, and WORKSPACE_LIST_FETCH_ERROR if an error occurs.
 */
export function listAction(payload: IFiltersParameters) {
  return asyncActionRawFactory(actionTypesList, payload, async () => {
    const [dataFolders, dataDocuments] = await Promise.all([getFolders(payload), getDocuments(payload)]);

    return {
      ...dataFolders,
      ...dataDocuments,
    };
  });
}
