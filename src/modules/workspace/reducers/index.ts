/**
 * Workspace Reducer
 */
import I18n from 'i18n-js';
import { combineReducers } from 'redux';

import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';
import { Filter } from '~/modules/workspace/types';

// Types

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
  directories: createAsyncActionTypes(moduleConfig.namespaceActionType('DIRECTORIES')),
};

export default combineReducers({
  directories: createSessionAsyncReducer(initialState.directories, actionTypes.directories),
});
