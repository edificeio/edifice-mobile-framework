/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import { asyncGetJson } from "../../../infra/redux/async";
import {IItems, IFiltersParameters, IFile, FilterId, IFolder, IItem} from "../../types";
import { filters } from "../../types/filters/helpers/filters";
import moment from "moment";

// TYPE -------------------------------------------------------------------------------------------

export type IBackendDocument = {
  _id: string;
  name: string;
  metadata: {
    name: "file";
    filename: string;
    "content-type": string;
    "content-transfer-encoding": string;
    charset: "UTF-8";
    size: number;
  };
  deleted: boolean;
  eParent: string | null;
  eType: "file";
  file: string;
  shared: [];
  inheritedShares: [];
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  thumbnails: { [id: string]: string };
};

export type IBackendDocumentArray = Array<IBackendDocument>;

// ADAPTER ----------------------------------------------------------------------------------------

const backendDocumentsAdapter: (data: IBackendDocumentArray) => IItems<IFile> = data => {
  const result = {} as IItems<IFile>;
  if (!data) return result;
  for (const item of data) {
    result[item._id] = {
      date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS").toDate().getTime(),
      filename: item.metadata.filename,
      id: item._id,
      isFolder: false,
      name: item.name,
      owner: filters(item.owner),
      ownerName: item.ownerName,
      size: item.metadata.size
    };
  }
  return result;
};

// FETCH -----------------------------------------------------------------------------------------

export function getDocuments(parameters: IFiltersParameters): Promise<IItems<IItem>> {
  const { parentId } = parameters;

  if (!parentId) return Promise.resolve({});

  const formatParameters = (parameters = {}) => {
    let result = "?";

    for (let key in parameters) {
      if (!(parameters as any)[key]) continue;
      if (key === "parentId" && (parameters as any)[key] in FilterId)    // its a root folder, no pass parentId
        continue;
      result = result.concat(`${key}=${(parameters as any)[key]}&`);
    }
    return result.slice(0, -1);
  };

  return asyncGetJson(`/workspace/documents${formatParameters(parameters)}`, backendDocumentsAdapter);
}
