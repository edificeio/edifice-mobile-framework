/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import {
  asyncActionTypes,
} from "../../infra/redux/async";
import config from "../config";
import { IItems, IFiltersParameters, IItem } from "../types";
import { getFolders } from "./helpers/folders";
import { getDocuments } from "./helpers/documents";

// ACTION LIST ------------------------------------------------------------------------------------


export const actionTypes = asyncActionTypes(
  config.createActionType("WORKSPACE_LIST")
);

export function listInvalidated() {
  return { type: actionTypes.invalidated };
}

export function listRequested() {
  return { type: actionTypes.requested };
}

export function listReceived(data: IItems<IItem>, id: string | undefined) {
  return { type: actionTypes.received, data, id, receivedAt: Date.now() };
}

export function listError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

/**
 * Get workspace list from the backend.
 * Dispatches WORKSPACE_LIST_REQUESTED, WORKSPACE_LIST_RECEIVED, and WORKSPACE_LIST_FETCH_ERROR if an error occurs.
 */
export function getList(parameters: IFiltersParameters) {
  return async (dispatch: any, state: any) => {
    dispatch(listRequested());

    try {
      let [dataFolders, dataDocuments] = await Promise.all([getFolders(parameters), getDocuments(parameters)]);

      dispatch(listReceived({ ...dataFolders, ...dataDocuments }, parameters.parentId));
    } catch (errmsg) {
      dispatch(listError(errmsg));
    }
  };
}
