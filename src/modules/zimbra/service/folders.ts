import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ICount } from '~/modules/zimbra/state/count';
import { IFolderList } from '~/modules/zimbra/state/folders';
import { IFolder } from '~/modules/zimbra/state/rootFolders';

// Data type of what is given by the backend.
export type RootFoldersBackend = {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: [];
}[];

export type FoldersBackend = {
  parent_id: string;
  trashed: boolean;
  depth: number;
  name: string;
  id: string;
}[];

const rootFoldersAdapter: (data: RootFoldersBackend) => IFolder[] = data => {
  return data.map(folder => ({
    id: folder.id,
    folderName: folder.folderName,
    path: folder.path,
    unread: folder.unread,
    count: folder.count,
    folders: folder.folders,
  }));
};

const foldersAdapter: (data: FoldersBackend) => IFolderList = data => {
  return data.map(folder => ({
    parent_id: folder.parent_id,
    trashed: folder.trashed,
    depth: folder.depth,
    name: folder.name,
    id: folder.id,
  }));
};

export const foldersService = {
  get: async () => {
    const folders = await fetchJSONWithCache(`/zimbra/folders/list`);
    return foldersAdapter(folders);
  },
  getRootFolders: async () => {
    const rootFolders = await fetchJSONWithCache(`/zimbra/root-folder`);
    return rootFoldersAdapter(rootFolders);
  },
  post: async (name: string, parentId: string | null = null) => {
    const body = {
      name,
    } as any;
    if (parentId) body.parentId = parentId;
    await fetchJSONWithCache(`/zimbra/folder`, {
      method: 'post',
      body: JSON.stringify(body),
    });
  },
  count: async (folderIds: string[]) => {
    const ids = folderIds.concat(['INBOX', 'SPAMS', 'DRAFTS']);
    const promises: Promise<any>[] = [];
    ids.forEach(id => {
      promises.push(fetchJSONWithCache(`/zimbra/count/${id}?unread=${id === 'DRAFTS' ? 'false' : 'true'}`));
    });
    const results = await Promise.all(promises);
    const ret: ICount = results.reduce((acc, res, i) => {
      const newAcc = { ...acc };
      newAcc[`${ids[i]}`] = res.count;
      return newAcc;
    }, {});
    return ret;
  },
};
