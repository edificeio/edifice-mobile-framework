/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import moment from "moment";
import { IFolder } from "../../types";

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
  externalId: string;
  inheritedShares: [];
  parents: [];
};

// ADAPTER ----------------------------------------------------------------------------------------

export function formatFolderResult(data: IBackendFolder): IFolder {
  const result = {} as IFolder;

  if (!data) {
    return result;
  }

  return {
    date: moment(data.modified, "YYYY-MM-DD HH:mm.ss.SSS")
      .toDate()
      .getTime(),
    id: data._id,
    isFolder: true,
    name: data.name,
    number: 1,
    owner: data.owner,
    ownerName: data.ownerName,
  };
}
