import I18n from 'i18n-js';
import moment from 'moment';
import queryString from 'query-string';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';
import { Filter, IFile } from '~/modules/workspace/reducer';

import { workspaceFolderListAdapter } from './folderAdaptater';

type IEntcoreWorkspaceDocument = {
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

type IEntcoreWorkspaceFolder = {
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

type IEntcoreWorkspaceFile = IEntcoreWorkspaceDocument | IEntcoreWorkspaceFolder;
type IEntcoreWorkspaceFileList = IEntcoreWorkspaceFile[];

const workspaceFileAdapter = (file: IEntcoreWorkspaceDocument | IEntcoreWorkspaceFolder | any) => {
  const ret = file.metadata
    ? {
        contentType: file.metadata['content-type'],
        date: moment(file.modified, 'YYYY-MM-DD HH:mm.ss.SSS').toDate().getTime(),
        id: file._id,
        isFolder: false,
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
        name: file.name,
        owner: file.owner as Filter,
        ownerName: file.ownerName,
      };
  return ret as IFile;
};

export const factoryRootFolder = (filter: Filter): IFile => {
  return {
    id: filter,
    date: 0,
    isFolder: true,
    name: I18n.t(filter),
    owner: '',
    ownerName: '',
    parentId: 'root',
  };
};

const compareFiles = (a: IFile, b: IFile): number => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
};

export const workspaceService = {
  files: {
    get: async (session: IUserSession, filter: Filter, parentId: string) => {
      let params = `?filter=${filter}`;

      if (!Object.values(Filter).includes(parentId as Filter)) {
        params += `&parentId=${parentId}`;
      }
      if (filter === Filter.SHARED && parentId === 'shared') {
        params += '&directShared=true';
      }
      params += '&includeall=true';
      const api = `/workspace/documents${params}`;
      const files = (await fetchJSONWithCache(api)) as IEntcoreWorkspaceFileList;
      return files.map(file => workspaceFileAdapter(file)).sort(compareFiles) as IFile[];
    },
    copy: async (session: IUserSession, parentId: string, ids: string[], destinationId: string) => {
      destinationId = destinationId === 'owner' ? 'root' : destinationId;
      const api = `/workspace/documents/copy/${destinationId}`;
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'POST',
        body,
      });
    },
    move: async (session: IUserSession, parentId: string, ids: string[], destinationId: string) => {
      destinationId = destinationId === 'owner' ? 'root' : destinationId;
      const api = `/workspace/documents/move/${destinationId}`;
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
    restore: async (session: IUserSession, parentId: string, ids: string[]) => {
      const api = '/workspace/documents/restore';
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
    trash: async (session: IUserSession, parentId: string, ids: string[]) => {
      const api = '/workspace/documents/trash';
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
    delete: async (session: IUserSession, parentId: string, ids: string[]) => {
      const api = '/workspace/documents';
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'DELETE',
        body,
      });
    },
  },
  file: {
    rename: async (session: IUserSession, id: string, name: string) => {
      const api = `/workspace/rename/${id}`;
      const body = JSON.stringify({ name });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
  },
  folders: {
    list: async (session: IUserSession) => {
      const api = '/workspace/folders/list?filter=owner&hierarchical=true';
      const folders = (await fetchJSONWithCache(api)) as IEntcoreWorkspaceFolder[];
      return workspaceFolderListAdapter(folders);
    },
  },
  folder: {
    create: async (session: IUserSession, name: string, parentId: string) => {
      const api = '/workspace/folder';
      const body = queryString.stringify({
        name,
        externalId: '',
        ...(parentId !== 'owner' ? { parentFolderId: parentId } : {}),
      });
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      };
      const folder = (await signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'POST',
        body,
        headers,
      })) as Promise<IEntcoreWorkspaceFolder>;
      return workspaceFileAdapter(folder);
    },
    rename: async (session: IUserSession, id: string, name: string) => {
      const api = `/workspace/folder/rename/${id}`;
      const body = JSON.stringify({ name });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
  },
};
