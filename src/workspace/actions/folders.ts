/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import workspaceConfig from "../config";
import { IWorkspaceBackendFolderArray, IWorkspaceFolderArray, IFoldersParameters, FiltersEnum } from "../types";

// ADAPTER ----------------------------------------------------------------------------------------

const backendFoldersAdapter: (data: IWorkspaceBackendFolderArray) => IWorkspaceFolderArray = data => {
  const result = {} as any;
  if (!data) return result;
  for (const item of data) {
    result[item._id] = {
      id: item._id,
      name: item.name,
      owner: item.owner,
      ownerName: item.ownerName,
    };
  }
  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(workspaceConfig.createActionType("FOLDERS"));

export function foldersListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function foldersListRequested() {
  return { type: actionTypes.requested };
}

export function foldersListReceived(data: IWorkspaceFolderArray) {
  return { type: actionTypes.received, data, receivedAt: Date.now() };
}

export function foldersListFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

export function getFilteredFolders(filter: FiltersEnum) {
  return getFolders({ filter });
}

export function getSubFolders(parentId: string) {
  return getFolders({ filter: FiltersEnum.owner, parentId });
}

function getFolders(parameters: Partial<IFoldersParameters>) {
  const formatParameters = (parameters = {}) => {
    let result = "?";
    for (let key in parameters) {
      if (parameters[key]) {
        result = result.concat(`${key}=${parameters[key]}&`);
      }
    }
    return result.slice(0, -1);
  };

  return async (dispatch, getState) => {
    dispatch(foldersListRequested());
    try {
      const data = await asyncGetJson(`/workspace/folders/list${formatParameters(parameters)}`, backendFoldersAdapter);
      dispatch(foldersListReceived(data));
    } catch (errmsg) {
      dispatch(foldersListFetchError(errmsg));
    }
  };
}
