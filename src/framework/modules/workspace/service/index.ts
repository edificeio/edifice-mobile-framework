/**
 * API Consumer for Backend Workspace application
 */
import queryString from 'query-string';

import { compareFiles, getImplicitWorkspaceUploadParams, workspaceFileAdapter } from './adapters';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { Filter, IFile } from '~/framework/modules/workspace/reducer';
import { workspaceFolderListAdapter } from '~/framework/modules/workspace/service/folderAdaptater';
import {
  IEntcoreWorkspaceDocument,
  IEntcoreWorkspaceFileList,
  IEntcoreWorkspaceFolder,
  IWorkspaceUploadParams,
} from '~/framework/modules/workspace/service/types';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileTransferService, { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { sessionFetch } from '~/framework/util/transport';

const workspaceService = {
  file: {
    rename: async (session: AuthActiveAccount, id: string, name: string) => {
      const api = `/workspace/rename/${id}`;
      const body = JSON.stringify({ name });
      return sessionFetch.json(api, {
        body,
        method: 'PUT',
      });
    },
    startUploadFile: (session: AuthActiveAccount, file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
      const api = '/workspace/document';
      const queryParams = params.public
        ? {
            application: 'media-library',
            public: true,
            quality: 1,
          }
        : {
            parent: params.parent,
            ...getImplicitWorkspaceUploadParams(params),
            //...getThumbnailWorkspaceUploadParams(),
          };
      const url = queryString.stringifyUrl({
        query: queryParams,
        url: api,
      });
      const adapter = (data: any) => {
        const datajson = JSON.parse(data) as IEntcoreWorkspaceDocument;
        const id = datajson._id;
        return {
          ...file,
          filename: datajson.name || file.filename,
          filesize: datajson.metadata?.size,
          id,
          url: datajson.public ? `/workspace/pub/document/${id}` : `/workspace/document/${id}`,
        };
      };
      return fileTransferService.startUploadFile<SyncedFileWithId>(session, file, { ...params, url }, adapter, callbacks);
    },
    uploadFile: (session: AuthActiveAccount, file: LocalFile, params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
      return workspaceService.file.startUploadFile(session, file, params, callbacks).promise;
    },
  },
  files: {
    copy: async (session: AuthActiveAccount, parentId: string, ids: string[], destinationId: string) => {
      destinationId = destinationId === 'owner' ? 'root' : destinationId;
      const api = `/workspace/documents/copy/${destinationId}`;
      const body = JSON.stringify({ ids, parentId });
      return sessionFetch.json(api, {
        body,
        method: 'POST',
      });
    },
    delete: async (session: AuthActiveAccount, parentId: string, ids: string[]) => {
      const api = '/workspace/documents';
      const body = JSON.stringify({ ids, parentId });
      return sessionFetch.json(api, {
        body,
        method: 'DELETE',
      });
    },
    get: async (session: AuthActiveAccount, filter: Filter, parentId: string) => {
      let params = `?filter=${filter}`;

      if (!Object.values(Filter).includes(parentId as Filter)) {
        params += `&parentId=${parentId}`;
      }
      if (filter === Filter.SHARED && parentId === 'shared') {
        params += '&directShared=true';
      }
      params += '&includeall=true';
      const api = `/workspace/documents${params}`;
      const files = await sessionFetch.json<IEntcoreWorkspaceFileList>(api);
      return files.map(file => workspaceFileAdapter(file)).sort(compareFiles) as IFile[];
    },
    move: async (session: AuthActiveAccount, parentId: string, ids: string[], destinationId: string) => {
      destinationId = destinationId === 'owner' ? 'root' : destinationId;
      const api = `/workspace/documents/move/${destinationId}`;
      const body = JSON.stringify({ ids, parentId });
      return sessionFetch.json(api, {
        body,
        method: 'PUT',
      });
    },
    restore: async (session: AuthActiveAccount, parentId: string, ids: string[]) => {
      const api = '/workspace/documents/restore';
      const body = JSON.stringify({ ids, parentId });
      return sessionFetch.json(api, {
        body,
        method: 'PUT',
      });
    },
    startUploadFiles: (
      session: AuthActiveAccount,
      files: LocalFile[],
      params: IWorkspaceUploadParams,
      callbacks?: IUploadCallbaks,
    ) => {
      return files.map(f => workspaceService.file.startUploadFile(session, f, params, callbacks));
    },
    trash: async (session: AuthActiveAccount, ids: string[], parentId?: string) => {
      const api = '/workspace/documents/trash';
      const body = JSON.stringify({ ids, parentId });
      return sessionFetch.json(api, {
        body,
        method: 'PUT',
      });
    },
    uploadFiles: (session: AuthActiveAccount, files: LocalFile[], params: IWorkspaceUploadParams, callbacks?: IUploadCallbaks) => {
      return Promise.all(workspaceService.files.startUploadFiles(session, files, params, callbacks).map(j => j.promise));
    },
  },
  folder: {
    create: async (session: AuthActiveAccount, name: string, parentId: string) => {
      const api = '/workspace/folder';
      const body = queryString.stringify({
        externalId: '',
        name,
        ...(parentId !== 'owner' ? { parentFolderId: parentId } : {}),
      });
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      };
      const folder = await sessionFetch.json<IEntcoreWorkspaceFolder>(api, {
        body,
        headers,
        method: 'POST',
      });
      return workspaceFileAdapter(folder);
    },
    rename: async (session: AuthActiveAccount, id: string, name: string) => {
      const api = `/workspace/folder/rename/${id}`;
      const body = JSON.stringify({ name });
      return sessionFetch.json(api, {
        body,
        method: 'PUT',
      });
    },
  },
  folders: {
    list: async () => {
      const api = '/workspace/folders/list?filter=owner&hierarchical=true';
      const folders = await sessionFetch.json<IEntcoreWorkspaceFolder[]>(api);
      return workspaceFolderListAdapter(folders);
    },
  },
};

export const computeVideoThumbnail = (id: string, size?: number[]) => {
  const session = assertSession();
  return `${session.platform.url}/workspace/document/${id}${size && size[0] && size[1] ? `?thumbnail=${size[0]}x${size[1]}` : ''}`;
};

export default workspaceService;
