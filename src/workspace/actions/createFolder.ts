// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import config from "../config";
import { IItem } from "../types/states";

export const actionTypesFolder = asyncActionTypes(config.createActionType("WORKSPACE_CREATE_FOLDER"));

export function folderRequested() {
  return { type: actionTypesFolder.requested };
}

export function folderReceived(data: IItem, id: string | undefined) {
  return { type: actionTypesFolder.received, data, id, receivedAt: Date.now() };
}

export function folderError(errmsg: string, id: string) {
  return { type: actionTypesFolder.fetchError, error: true, errmsg, id };
}

/**
 * Get workspace folder from the backend.
 * Dispatches WORKSPACE_FOLDER_REQUESTED, WORKSPACE_FOLDER_RECEIVED, and WORKSPACE_FOLDER_FETCH_ERROR if an error occurs.
 */
export async function createFolderAction({ parentId, ...rest }) {
  return async (dispatch: any) => {
    dispatch(folderRequested());

    try {
      const dataFolder = await asyncGetJson("/workspace/folders/create", (data: any) => (data: any) => {
        return JSON.parse(data);
      });

      dispatch(folderReceived({ ...dataFolder }, parentId));
    } catch (errmsg) {
      dispatch(folderError(errmsg, parentId));
    }
  };
}
