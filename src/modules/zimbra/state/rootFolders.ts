import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import mailConfig from '~/modules/zimbra/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface IFolder {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: [];
}

export type IRootFolderList = IFolder[];

// THE STATE --------------------------------------------------------------------------------------

export const initialState: IRootFolderList = [
  {
    id: '',
    folderName: '',
    path: '',
    unread: 0,
    count: 0,
    folders: [],
  },
];

export type IRootFoldersListState = AsyncState<IRootFolderList>;

export const getRootFolderListState = (globalState: any) => mailConfig.getState(globalState).rootFolders as IRootFoldersListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypesRootFolders = createAsyncActionTypes(mailConfig.namespaceActionType('ROOT_FOLDER_LIST'));
