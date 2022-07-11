/**
 * Workspace Reducer
 */
import I18n from 'i18n-js';
import { combineReducers } from 'redux';

import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';

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
};

const factoryRootFolder = (filter: Filter): IFile => {
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

// State

interface IWorkspace_StateData {
  directories: IDirectory<IFile[]>;
}

export interface IWorkspace_State {
  directories: AsyncState<IDirectory<IFile[]>>;
}

// Reducer

const initialState: IWorkspace_StateData = {
  directories: {
    root: [
      factoryRootFolder(Filter.OWNER),
      factoryRootFolder(Filter.PROTECTED),
      factoryRootFolder(Filter.SHARED),
      factoryRootFolder(Filter.TRASH),
    ],
  },
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

export default combineReducers({
  directories: createSessionAsyncReducer(initialState.directories, actionTypes.directories),
});
