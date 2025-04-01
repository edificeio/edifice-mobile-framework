import { Resource } from '~/framework/modules/mediacentre/model';
import moduleConfig from '~/framework/modules/mediacentre/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

export type FavoritesStateData = Resource[];
export type FavoritesState = AsyncState<FavoritesStateData>;

const initialState: FavoritesStateData = [];

export const actionTypes = {
  ...createAsyncActionTypes(moduleConfig.namespaceActionType('FAVORITES')),
  addError: moduleConfig.namespaceActionType('FAVORITE_ADD_ERROR'),
  addReceipt: moduleConfig.namespaceActionType('FAVORITE_ADD_RECEIPT'),
  addRequest: moduleConfig.namespaceActionType('FAVORITE_ADD_REQUEST'),
  removeError: moduleConfig.namespaceActionType('FAVORITE_REMOVE_ERROR'),
  removeReceipt: moduleConfig.namespaceActionType('FAVORITE_REMOVE_RECEIPT'),
  removeRequest: moduleConfig.namespaceActionType('FAVORITE_REMOVE_REQUEST'),
};
export const actions = {
  ...createAsyncActionCreators<FavoritesStateData>(actionTypes),
  addError: (error: Error) => ({ error, type: actionTypes.addError }),
  addReceipt: (resource: Resource) => ({ resource, type: actionTypes.addReceipt }),
  addRequest: () => ({ type: actionTypes.addRequest }),
  removeError: (error: Error) => ({ error, type: actionTypes.removeError }),
  removeReceipt: (resource: Resource) => ({ resource, type: actionTypes.removeReceipt }),
  removeRequest: () => ({ type: actionTypes.removeRequest }),
};

const editFavoritesHandlerMap = {
  [actionTypes.addReceipt]: (state: FavoritesStateData, action) => {
    return state.concat(action.resource);
  },
  [actionTypes.removeReceipt]: (state: FavoritesStateData, action) => {
    return state.filter(resource => resource.id !== action.resource.id && resource.source === action.resource.source);
  },
};

export default createSessionAsyncReducer(initialState, actionTypes, editFavoritesHandlerMap);
