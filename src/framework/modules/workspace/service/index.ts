/**
 * API Consumer for Backend Workspace application
 */

import queryString from 'query-string';

import { LocalFile } from '../../../util/fileHandler';
import fileTransferService, { IUploadCallbaks, IUploadCommonParams } from '../../../util/fileHandler/service';
import { IUserSession } from '../../../util/session';

const implicitWorkspaceUploadParams = {
  owner: {}, // Exists BackEnd side but not useed yet!
  protected: { protected: 'true', application: 'media-library' },
  root: {}, // Exists BackEnd side but not useed yet! // Exists BackEnd side but not useed yet!
  shared: {}, // Exists BackEnd side but not useed yet!
  trash: {}, // Exists BackEnd side but not useed yet!
};
export interface IWorkspaceUploadParams extends IUploadCommonParams {
  parent?: keyof implicitWorkspaceUploadParams | string;
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
      // console.log("data", data);
      const datajson = JSON.parse(data) as IWorkspaceUploadResultBackend;
      const id = datajson['_id'];
      return {
        ...file,
        fileid: id,
        url: `/workspace/document/${id}`,
        filesize: datajson['metadata']?.['size'],
        filename: datajson['name'] || file.filename,
      };
    };
    return fileTransferService.startUploadFile(session, file, { ...params, url }, adapter, callbacks);
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
};

export default workspaceService;
