/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import config from "../config";
import { FilterId, IFiltersParameters, IFolder, IItems } from "../types";
import { formatResults } from "./helpers/documents";
import { asyncActionRawFactory } from "../../infra/actions/asyncActionFactory";
import { IRootItems } from "../types/states/items";
import { IId } from "../../types";
import { factoryRootFolder } from "./helpers/factoryRootFolder";

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypesList = asyncActionTypes(config.createActionType("/workspace/list"));

/**
 * Get workspace list from the backend.
 * Dispatches WORKSPACE_LIST_REQUESTED, WORKSPACE_LIST_RECEIVED, and WORKSPACE_LIST_FETCH_ERROR if an error occurs.
 */
export function listAction(payload: IFiltersParameters) {
  return asyncActionRawFactory(actionTypesList, payload, async () => {
    const { parentId } = payload;

    if (parentId === FilterId.root) {
      return getRootFolders();
    }
    const [dataFolders, dataDocuments] = await Promise.all([getFolders(payload), getDocuments(payload)]);

    return {
      ...dataFolders,
      ...dataDocuments,
    };
  });
}

const formatParameters = (parameters = {}) => {
  let result = "?";

  for (let key in parameters) {
    if (!(parameters as any)[key]) {
      // skip empty parameters
      continue;
    }
    if (key === "parentId" && (parameters as any)[key] in FilterId) {
      // its a root folder, no pass parentId
      continue;
    }
    result = result.concat(`${key}=${(parameters as any)[key]}&`);
  }
  return result.slice(0, -1);
};

// GET -----------------------------------------------------------------------------------------

export function getDocuments(parameters: IFiltersParameters): Promise<IRootItems<IId>> {
  return asyncGetJson(`/workspace/documents${formatParameters(parameters)}`, formatResults);
}

export function getFolders(parameters: IFiltersParameters): Promise<IRootItems<IId>> {
  return asyncGetJson(`/workspace/folders/list${formatParameters(parameters)}`, formatResults);
}

const getRootFolders: () => IItems<IFolder> = () => {
  const result = {} as IItems<IFolder>;

  result[FilterId.owner] = factoryRootFolder(FilterId.owner);
  result[FilterId.protected] = factoryRootFolder(FilterId.protected);
  result[FilterId.shared] = factoryRootFolder(FilterId.shared);
  result[FilterId.trash] = factoryRootFolder(FilterId.trash);

  return result;
};
