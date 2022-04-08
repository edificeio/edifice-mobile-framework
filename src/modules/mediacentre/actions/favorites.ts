import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { favoritesService } from '~/modules/mediacentre/services/favorites';
import { IFavorites, actionTypes } from '~/modules/mediacentre/state/favorites';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<IFavorites>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchFavoritesAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await favoritesService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function addFavoriteAction(resourceId: string, resource: Resource) {
  return async (dispatch: Dispatch) => {
    try {
      await favoritesService.post(resourceId, resource);
      dispatch(dataActions.request());
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function removeFavoriteAction(resourceId: string, source: Source) {
  return async (dispatch: Dispatch) => {
    try {
      await favoritesService.delete(resourceId, source);
      dispatch(dataActions.request());
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}