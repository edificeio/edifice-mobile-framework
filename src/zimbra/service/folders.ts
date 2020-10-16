import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { ICount } from "../state/count";
import { IFolderList } from "../state/folders";

// Data type of what is given by the backend.
export type FoldersBackend = {
  parent_id: string;
  trashed: boolean;
  depth: number;
  name: string;
  id: string;
}[];

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
  post: async (name: string, parentId: string | null = null) => {
    const body = {
      name,
    } as any;
    if (parentId) body.parentId = parentId;
    await fetchJSONWithCache(`/zimbra/folder`, {
      method: "post",
      body: JSON.stringify(body),
    });
  },
  count: async (folderIds: string[]) => {
    const ids = folderIds.concat(["INBOX", "SPAMS", "DRAFTS"]);
    const promises: Promise<any>[] = [];
    ids.forEach(id => {
      promises.push(fetchJSONWithCache(`/zimbra/count/${id}?unread=${id === "DRAFTS" ? "false" : "true"}`));
    });
    const results = await Promise.all(promises);
    const ret: ICount = results.reduce((acc, res, i) => {
      const new_acc = { ...acc };
      new_acc[`${ids[i]}`] = res.count;
      return new_acc;
    }, {});
    return ret;
  },
};
