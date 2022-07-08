import moment from 'moment';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';
import { IFile } from '~/modules/workspace/reducer';
import { Filter } from '~/modules/workspace/types';

export type IEntcoreWorkspaceDocument = {
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

export type IEntcoreWorkspaceFolder = {
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
      params += '&includeall=true';
      const api = `/workspace/documents${params}`;
      const files = (await fetchJSONWithCache(api)) as IEntcoreWorkspaceFileList;
      return files.map(file => workspaceFileAdapter(file)).sort(compareFiles) as IFile[];
    },
    copy: async (session: IUserSession, parentId: string, ids: string[], destinationId: string) => {
      const api = `/workspace/documents/copy/${destinationId}`;
      const body = JSON.stringify({ parentId, ids });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
    move: async (session: IUserSession, parentId: string, ids: string[], destinationId: string) => {
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
    rename: async (session: IUserSession, parentId: string, id: string, name: string) => {
      const api = `/workspace/rename/${id}`;
      const body = JSON.stringify({ parentId, name });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
  },
  folder: {
    rename: async (session: IUserSession, parentId: string, id: string, name: string) => {
      const api = `/workspace/folder/rename/${id}`;
      const body = JSON.stringify({ parentId, name });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'PUT',
        body,
      });
    },
  },
};
