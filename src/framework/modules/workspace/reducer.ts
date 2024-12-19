/**
 * Workspace Reducer
 */
import { combineReducers } from 'redux';

import moduleConfig from './module-config';

import { Reducers } from '~/app/store';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

// Types

export enum Filter {
  OWNER = 'owner',
  PROTECTED = 'protected',
  ROOT = 'root',
  SHARED = 'shared',
  TRASH = 'trash',
}

export type IDirectory<T> = {
  [key: string]: T;
};

export type IFile = {
  id: string;
  date: number;
  isFolder: boolean;
  name: string;
  owner: string;
  ownerName: string;
  parentId: string;
  contentType?: string;
  size?: number;
  url?: string;
  key: string;
};

export type IFolder = {
  id: string;
  name: string;
  parentId: string;
  sortNo: string;
  children: IFolder[];
};

// State

interface IWorkspaceStateData {
  directories: IDirectory<IFile[]>;
  folderTree: IFolder[];
}

export interface IWorkspaceState {
  directories: AsyncState<IDirectory<IFile[]>>;
  folderTree: AsyncState<IFolder[]>;
}

// Reducer

const initialState: IWorkspaceStateData = {
  directories: {},
  folderTree: [],
};

export const actionTypes = {
  copy: createAsyncActionTypes(moduleConfig.namespaceActionType('COPY')),
  createFolder: createAsyncActionTypes(moduleConfig.namespaceActionType('CREATE_FOLDER')),
  delete: createAsyncActionTypes(moduleConfig.namespaceActionType('DELETE')),
  directories: createAsyncActionTypes(moduleConfig.namespaceActionType('DIRECTORIES')),
  download: createAsyncActionTypes(moduleConfig.namespaceActionType('DOWNLOAD')),
  listFolders: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_FOLDERS')),
  move: createAsyncActionTypes(moduleConfig.namespaceActionType('MOVE')),
  preview: createAsyncActionTypes(moduleConfig.namespaceActionType('PREVIEW')),
  rename: createAsyncActionTypes(moduleConfig.namespaceActionType('RENAME')),
  restore: createAsyncActionTypes(moduleConfig.namespaceActionType('RESTORE')),
  share: createAsyncActionTypes(moduleConfig.namespaceActionType('SHARE')),
  trash: createAsyncActionTypes(moduleConfig.namespaceActionType('TRASH')),
  upload: createAsyncActionTypes(moduleConfig.namespaceActionType('UPLOAD')),
};

const reducer = combineReducers({
  directories: createSessionAsyncReducer(initialState.directories, actionTypes.directories),
  folderTree: createSessionAsyncReducer(initialState.folderTree, actionTypes.listFolders),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
