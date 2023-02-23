import { IInitMail } from '~/framework/modules/conversation/state/initMails';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// Data type of what is given by the backend.
export type IInitMailListBackend = {
  id: string;
  name: string;
  nbUnread: number;
  parent_id: string;
  user_id: string;
  depth: number;
  trashed: boolean;
  skip_uniq: boolean;
}[];

const initMailListAdapter: (rootFoldersList: IInitMailListBackend) => IInitMail = rootFoldersList => {
  let result = {} as IInitMail;
  if (!rootFoldersList) return result;
  const folders = rootFoldersList.map(rootFolder => ({
    id: rootFolder.id,
    folderName: rootFolder.name,
    unread: rootFolder.nbUnread,
    folders: [],
    // Extra data
    parent_id: rootFolder.parent_id,
    user_id: rootFolder.user_id,
    depth: rootFolder.depth,
    trashed: rootFolder.trashed,
    skip_uniq: rootFolder.skip_uniq,
  }));

  result = {
    folders,
  };
  return result;
};

export const initMailService = {
  get: async () => {
    const rootFoldersList = await fetchJSONWithCache(`/conversation/userfolders/list?unread=true`);
    return initMailListAdapter(rootFoldersList);
  },
};
