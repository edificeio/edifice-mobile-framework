import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { IFolderList } from "../state/folders";

// Data type of what is given by the backend.
export type FoldersBackend = {
  parent_id: string;
  trashed: boolean;
  depth: number;
  name: string;
}[];

const foldersAdapter: (data: FoldersBackend) => IFolderList = data => {
  return data.map(folder => ({
    parent_id: folder.parent_id,
    trashed: folder.trashed,
    depth: folder.depth,
    name: folder.name,
  }));
};

export const foldersService = {
  get: async () => {
    const folders = await fetchJSONWithCache(`/zimbra/folders/list`);
    return foldersAdapter(folders);
  },
  post: async (name: string, parentId: string | null = null) => {
    const body = {
      name,
    } as any;
    if (parentId) body.parentId = parentId;
    await fetchJSONWithCache(`/zimbra/folder`, {
      method: "post",
      body: JSON.stringify(body),
    });
    return {
      name,
      parent_id: parentId,
    };
  },
};
