import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IInitMail } from "../state/initMails";

// Data type of what is given by the backend.
// eslint-disable-next-line flowtype/no-types-missing-file-annotation
export type IInitMailListBackend = {
  id: string;
  name: string;
  parent_id: string;
  user_id: string;
  depth: number;
  trashed: boolean;
}[];

const initMailListAdapter: (rootFoldersList: IInitMailListBackend) => IInitMail = rootFoldersList => {
  let result = {} as IInitMail;
  if (!rootFoldersList) return result;
  const folders = rootFoldersList.map(rootFolder => ({
    id: rootFolder.id,
    folderName: rootFolder.name,
    path: "",
    unread: 0,
    count: 0,
    folders: []
  }));

  result = {
    folders
  };
  return result;
};

export const initMailService = {
  get: async () => {
    const rootFoldersList = await fetchJSONWithCache(`/conversation/folders/list`);
    return initMailListAdapter(rootFoldersList);
  },
};
