/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */
import moment from 'moment';

import config from '~/modules/workspace/moduleConfig';
import { IFile, IFolder, IItem, IItems } from '~/modules/workspace/types';
import { filters } from '~/modules/workspace/types/filters/helpers/filters';

export type IDocumentArray = any[];

// File TYPE -------------------------------------------------------------------------------------------

export type IBackendDocument = {
  _id: string;
  name: string;
  metadata: {
    name: 'file';
    filename: string;
    'content-type': string;
    'content-transfer-encoding': string;
    charset: 'UTF-8';
    size: number;
  };
  deleted: boolean;
  eParent: string | null;
  eType: 'file';
  file: string;
  shared: [];
  inheritedShares: [];
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  thumbnails: { [id: string]: string };
};

// ADAPTER ----------------------------------------------------------------------------------------

function formatFileResult(item: IBackendDocument): IFile {
  if (!item || !item._id) return {} as IFile;

  return {
    contentType: item.metadata['content-type'],
    date: moment(item.modified, 'YYYY-MM-DD HH:mm.ss.SSS').toDate().getTime(),
    filename: item.name,
    id: item._id,
    isFolder: false,
    name: item.name,
    owner: filters(item.owner),
    ownerName: item.ownerName,
    size: item.metadata.size,
    url: `/workspace/document/${item._id}`,
  };
}

// Folder TYPE -------------------------------------------------------------------------------------------

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

function formatFolderResult(item: IBackendFolder): IFolder {
  if (!item || !item._id) return {} as IFolder;
  if (item.externalId && (config as any).blacklistFolders && (config as any).blacklistFolders.includes(item.externalId))
    return {} as IFolder;
  return {
    date: moment(item.modified, 'YYYY-MM-DD HH:mm.ss.SSS').toDate().getTime(),
    id: item._id,
    isFolder: true,
    name: item.name,
    owner: filters(item.owner),
    ownerName: item.ownerName,
    number: 1,
  };
}

// ADAPTER ----------------------------------------------------------------------------------------

function formatResult(item: IBackendDocument | IBackendFolder | any): IFile | IFolder {
  if (item.metadata) return formatFileResult(item as IBackendDocument);
  else return formatFolderResult(item as IBackendFolder);
}

function checkAncestorsAndFormat(result, item, parentId) {
  const { eParent } = item;

  if (typeof item === 'string') {
    result[item as string] = item;
    return result;
  }

  if (!parentId || eParent === parentId || (!eParent && parentId === 'owner')) {
    result[item._id] = formatResult(item);
    return result;
  }

  return result;
}

export const formatResults: (
  data: IDocumentArray | IBackendDocument | IBackendFolder | string[],
  parentId?: string,
) => IItems<IItem | string> = (data, parentId) => {
  let result = {} as IItems<IFile | IFolder | string>;

  if (!data) {
    return result;
  } else if (data instanceof Array) {
    (data as any[]).map(item => (result = checkAncestorsAndFormat(result, item, parentId)));
    return result;
  } else {
    return checkAncestorsAndFormat(result, data, parentId);
  }
};
