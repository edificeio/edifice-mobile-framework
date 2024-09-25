/**
 * Mediacentre Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

import { MediacentreResources, Resource } from './model';
import moduleConfig from './module-config';

interface MediacentreReduxStateData {
  resources: MediacentreResources;
  search: Resource[];
}

export interface MediacentreReduxState {
  resources: AsyncState<MediacentreResources>;
  search: AsyncState<Resource[]>;
}

const initialState: MediacentreReduxStateData = {
  resources: {
    externals: [],
    favorites: [],
    signets: [],
    textbooks: [],
  },
  search: [],
};

export const actionTypes = {
  addFavorite: createAsyncActionTypes(moduleConfig.namespaceActionType('ADD_FAVORITE')),
  fetchFavorites: createAsyncActionTypes(moduleConfig.namespaceActionType('FETCH_FAVORITES')),
  fetchResources: createAsyncActionTypes(moduleConfig.namespaceActionType('FETCH_RESOURCES')),
  removeFavorite: createAsyncActionTypes(moduleConfig.namespaceActionType('REMOVE_FAVORITE')),
  search: createAsyncActionTypes(moduleConfig.namespaceActionType('SEARCH')),
};

const reducer = combineReducers({
  favorites: createSessionAsyncReducer(initialState.resources.favorites, actionTypes.fetchFavorites),
  search: createSessionAsyncReducer(initialState.search, actionTypes.search),
  resources: createSessionAsyncReducer(initialState.resources, actionTypes.fetchResources),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
