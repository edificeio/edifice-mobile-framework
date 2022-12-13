/**
 * API Consumer for Backend Workspace application
 */
import queryString from 'query-string';

import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileTransferService, { IUploadCallbaks, IUploadCommonParams } from '~/framework/util/fileHandler/service';
import { IUserSession } from '~/framework/util/session';
import { signedFetchJson2 } from '~/infra/fetchWithCache';
import { assertSession } from '~/framework/modules/auth/reducer';

const implicitWorkspaceUploadParams = {
  owner: {}, // Exists BackEnd side but not useed yet!
  protected: { protected: 'true', application: 'media-library' },
  root: {}, // Exists BackEnd side but not useed yet! // Exists BackEnd side but not useed yet!
  shared: {}, // Exists BackEnd side but not useed yet!
  trash: {}, // Exists BackEnd side but not useed yet!
};

export type WorkspaceParentItem = keyof typeof implicitWorkspaceUploadParams | string;
export interface IWorkspaceUploadParams extends IUploadCommonParams {
  parent?: WorkspaceParentItem;
}

const getImplicitWorkspaceUploadParams = (params: IWorkspaceUploadParams) => {
  return !params?.parent ? {} : implicitWorkspaceUploadParams[params.parent] || { parentId: params.parent };
};

const getThumbnailWorkspaceUploadParams = () => {
  return {
    quality: '1',
    thumbnail: ['100x100', '120x120', '290x290', '381x381', '1600x0'],
  };
};

export interface IWorkspaceUploadResultBackend {
  _id: string;
  ancestors: unknown[];
  application: string;
  created: string;
  eParent: unknown;
  eType: string;
  file: string;
  fileDate: string;
  inheritedShares: unknown[];
  isShared: boolean;
  metadata: {
    charset: string;
    'content-transfer-encoding': string;
    'content-type': string;
    filename: string;
    name: string;
    size: number;
  };
  modified: string;
  name: string;
  nameSearch: string; // basically name in lowercase
  owner: string;
  ownerName: string;
  shared: unknown[];
}

export interface IWorkspaceCreateFolderResultBackend {
  name: string;
  application: string;
  shared: unknown[];
  inheritedShares: unknown[];
  isShared: boolean;
  ancestors: unknown[];
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  nameSearch: string;
  eType: 'folder';
  _id: string;
}

const workspaceService = {
  /** Upload files to user's personal workspace. */
  startUploadFile: (session: IUserSession, file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
    const api = '/workspace/document';
    const queryParams = { parent: params.parent };
    const url = queryString.stringifyUrl({
      url: api,
      query: { ...queryParams, ...getImplicitWorkspaceUploadParams(params), ...getThumbnailWorkspaceUploadParams() },
    });
    const adapter = (data: any) => {
      const datajson = JSON.parse(data) as IWorkspaceUploadResultBackend;
      const id = datajson['_id'];
      return {
        ...file,
        id,
        url: `/workspace/document/${id}`,
        filesize: datajson['metadata']?.['size'],
        filename: datajson['name'] || file.filename,
      };
    };
    return fileTransferService.startUploadFile<SyncedFileWithId>(session, file, { ...params, url }, adapter, callbacks);
  },

  uploadFile: (session: IUserSession, file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
    return workspaceService.startUploadFile(session, file, params, callbacks).promise;
  },

  startUploadFiles: (session: IUserSession, files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
    return files.map(f => workspaceService.startUploadFile(session, f, params, callbacks));
  },

  uploadFiles: (session: IUserSession, files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
    return Promise.all(workspaceService.startUploadFiles(session, files, params, callbacks).map(j => j.promise));
  },

  createFolder: (session: IUserSession, name: string, parentFolderId?: string) => {
    const api = '/workspace/folder';
    const method = 'POST';
    const body = queryString.stringify({
      name,
      externalId: '',
      ...(parentFolderId ? { parentFolderId } : {}),
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };
    return signedFetchJson2(api, { method, body, headers }) as Promise<IWorkspaceCreateFolderResultBackend>;
  },
};

export const computeVideoThumbnail = (id: string, size?: number[]) => {
  const session = assertSession();
  return `${session.platform.url}/workspace/document/${id}${
    size && size[0] && size[1] ? `?thumbnail=${size[0]}x${size[1]}` : ''
  }`;
}

export default workspaceService;
