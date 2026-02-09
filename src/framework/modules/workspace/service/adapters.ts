import moment from 'moment';

import { I18n } from '~/app/i18n';
import { Filter, IFile } from '~/framework/modules/workspace/reducer';
import {
  IEntcoreWorkspaceDocument,
  IEntcoreWorkspaceFolder,
  implicitWorkspaceUploadParams,
  IWorkspaceUploadParams,
} from '~/framework/modules/workspace/service/types';

export const workspaceFileAdapter = (file: IEntcoreWorkspaceDocument | IEntcoreWorkspaceFolder | any) => {
  const ret = file.metadata
    ? {
        contentType: file.metadata['content-type'],
        date: moment(file.modified, 'YYYY-MM-DD HH:mm.ss.SSS').toDate().getTime(),
        id: file._id,
        isFolder: false,
        key: file._id,
        name: file.name,
        owner: file.owner as Filter,
        ownerName: file.ownerName,
        size: file.metadata.size,
        url: `/workspace/document/${file._id}`,
      }
    : {
        date: moment(file.modified, 'YYYY-MM-DD HH:mm.ss.SSS').toDate().getTime(),
        id: file._id,
        isFolder: true,
        key: file._id,
        name: file.name,
        owner: file.owner as Filter,
        ownerName: file.ownerName,
      };
  return ret as IFile;
};

const i18nFolderName = {
  [Filter.OWNER]: 'workspace-filelist-owner',
  [Filter.PROTECTED]: 'workspace-filelist-protected',
  [Filter.ROOT]: 'workspace-filelist-root',
  [Filter.SHARED]: 'workspace-filelist-shared',
  [Filter.TRASH]: 'workspace-filelist-trash',
};

export const factoryRootFolder = (filter: Filter): IFile => {
  return {
    date: 0,
    id: filter,
    isFolder: true,
    key: filter,
    name: I18n.get(i18nFolderName[filter]),
    owner: '',
    ownerName: '',
    parentId: 'root',
  };
};

export const compareFiles = (a: IFile, b: IFile): number => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
};

export const getImplicitWorkspaceUploadParams = (params: IWorkspaceUploadParams) => {
  return !params?.parent ? {} : implicitWorkspaceUploadParams[params.parent] || { parentId: params.parent };
};

/** 
const getThumbnailWorkspaceUploadParams = () => {
  return {
    quality: '1',
    thumbnail: [
      '100x100',
      '120x120',
      '150x150',
      '2600x0',
      `${UI_SIZES.standardScreen.width / 2}x0`,
      `${UI_SIZES.standardScreen.width}x0`,
      `${IMAGE_MAX_DIMENSION}x0`,
    ],
  };
};
*/
