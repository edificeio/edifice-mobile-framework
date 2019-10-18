/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncGetJson } from "../../../infra/redux/async";
import { FilterId, IItems, IFolder, IFiltersParameters } from "../../types";
import { factoryRootFolder } from "./factoryRootFolder";
import moment from "moment";

// TYPE -------------------------------------------------------------------------------------------

export type IBackendFolder = {
  _id: string;
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  name: string;
  application: string;
  shared: [];
  ancestors: [];
  deleted: boolean;
  eParent: string | null;
  eType: string;
  inheritedShares: [];
  parents: [];
};

export type IBackendFolderArray = Array<IBackendFolder>;

// ADAPTER ----------------------------------------------------------------------------------------

const backendFoldersAdapter: (data: IBackendFolderArray) => IItems<IFolder> = data => {
  const result = {} as IItems<IFolder>;
  if (!data) return result;
  for (const item of data) {
    result[item._id] = {
      date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS").toDate().getTime(),
      id: item._id,
      isFolder: true,
      name: item.name,
      number: 1,
      owner: item.owner,
      ownerName: item.ownerName,
    };
  }
  return result;
};

// ROOT FOLDERS ----------------------------------------------------------------------------------

const getRootFolders: () => IItems<IFolder> = () => {
  const result = {} as IItems<IFolder>;

  result[FilterId.owner] = factoryRootFolder(FilterId.owner);
  result[FilterId.protected] = factoryRootFolder(FilterId.protected);
  result[FilterId.shared] = factoryRootFolder(FilterId.shared);
  result[FilterId.trash] = factoryRootFolder(FilterId.trash);

  return result;
};

// THUNKS -----------------------------------------------------------------------------------------

export function getFilteredFolders(filter: FilterId) {
  return getFolders({ filter });
}

export function getSubFolders(parentId: string) {
  return getFolders({ filter: FilterId.owner, parentId });
}

export async function getFolders(parameters: IFiltersParameters) {
  const { parentId } = parameters;

  if (!parentId)
    return getRootFolders();

  const formatParameters = (parameters = {}) => {
    let result = "?";
    for (let key in parameters) {
      if ((parameters as any)[key] == undefined)
        continue;
      if (key === "parentId" && (parameters as any)[key] in FilterId)    // its a root folder, no pass parentId
        continue;
      result = result.concat(`${key}=${(parameters as any)[key]}&`);
    }
    return result.slice(0, -1);
  };

  return await asyncGetJson(`/workspace/folders/list${formatParameters(parameters)}`, backendFoldersAdapter);
}

