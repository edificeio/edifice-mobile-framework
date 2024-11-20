/**
 * Mediacentre Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

import moduleConfig from './module-config';

export enum Source {
  GAR = 'fr.openent.mediacentre.source.GAR',
  MOODLE = 'fr.openent.mediacentre.source.Moodle',
  PMB = 'fr.openent.mediacentre.source.PMB',
  SIGNET = 'fr.openent.mediacentre.source.Signet',
}

export interface IResource {
  id: string;
  uid?: string;
  title: string;
  plain_text: string;
  image: string;
  types: string[];
  source: Source;
  link: string;
  authors: string[];
  editors: string[];
  disciplines: string[];
  levels: string[];
  user: string;
  favorite?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
}

export type IResourceList = IResource[];

export interface ISignets {
  orientation: IResourceList;
  shared: IResourceList;
}

export interface IMediacentreReduxState {
  externals: AsyncState<IResourceList>;
  favorites: AsyncState<IResourceList>;
  search: AsyncState<IResourceList>;
  signets: AsyncState<ISignets>;
  textbooks: AsyncState<IResourceList>;
}

interface IMediacentreReduxStateData {
  externals: IResourceList;
  favorites: IResourceList;
  search: IResourceList;
  signets: ISignets;
  textbooks: IResourceList;
}

const initialState: IMediacentreReduxStateData = {
  externals: [],
  favorites: [],
  search: [],
  signets: {
    orientation: [],
    shared: [],
  },
  textbooks: [],
};

export const actionTypes = {
  addFavorite: createAsyncActionTypes(moduleConfig.namespaceActionType('ADD_FAVORITE')),
  externals: createAsyncActionTypes(moduleConfig.namespaceActionType('EXTERNALS')),
  fetchFavorites: createAsyncActionTypes(moduleConfig.namespaceActionType('FETCH_FAVORITES')),
  removeFavorite: createAsyncActionTypes(moduleConfig.namespaceActionType('REMOVE_FAVORITE')),
  search: createAsyncActionTypes(moduleConfig.namespaceActionType('SEARCH')),
  signets: createAsyncActionTypes(moduleConfig.namespaceActionType('SIGNETS')),
  textbooks: createAsyncActionTypes(moduleConfig.namespaceActionType('TEXTBOOKS')),
};

const reducer = combineReducers({
  externals: createSessionAsyncReducer(initialState.externals, actionTypes.externals),
  favorites: createSessionAsyncReducer(initialState.favorites, actionTypes.fetchFavorites),
  search: createSessionAsyncReducer(initialState.search, actionTypes.search),
  signets: createSessionAsyncReducer(initialState.signets, actionTypes.signets),
  textbooks: createSessionAsyncReducer(initialState.textbooks, actionTypes.textbooks),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
