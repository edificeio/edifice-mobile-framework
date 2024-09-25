/**
 * Mediacentre Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

import { Resource } from './model';
import moduleConfig from './module-config';

interface MediacentreReduxStateData {
  externals: Resource[];
  favorites: Resource[];
  search: Resource[];
  signets: Resource[];
  textbooks: Resource[];
}

export interface MediacentreReduxState {
  externals: AsyncState<Resource[]>;
  favorites: AsyncState<Resource[]>;
  search: AsyncState<Resource[]>;
  signets: AsyncState<Resource[]>;
  textbooks: AsyncState<Resource[]>;
}

const initialState: MediacentreReduxStateData = {
  externals: [],
  favorites: [],
  search: [],
  signets: [],
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
