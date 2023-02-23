import folderConfig from '~/framework/modules/conversation/module-config';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IFolder {
  parent_id: string;
  trashed: boolean;
  depth: number;
  name: string;
  id: string;
}

export type IFolderList = IFolder[];

// THE STATE --------------------------------------------------------------------------------------

export type IFolderListState = AsyncState<IFolderList>;

export const initialState: IFolderList = [];

export const getFolderListState = (globalState: any) => folderConfig.getState(globalState).folders as IFolderListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(folderConfig.namespaceActionType('FOLDERS_LIST'));
