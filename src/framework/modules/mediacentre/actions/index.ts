/**
 * Mediacentre actions
 */
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { MediacentreResources, Resource, Source } from '~/framework/modules/mediacentre/model';
import { actionTypes } from '~/framework/modules/mediacentre/reducer';
import { mediacentreService } from '~/framework/modules/mediacentre/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const resourcesActionsCreators = createAsyncActionCreators(actionTypes.fetchResources);
export const fetchResourcesAction = (): ThunkAction<Promise<MediacentreResources>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(resourcesActionsCreators.request());
    const [externals, favorites, signets, textbooks] = await Promise.all([
      mediacentreService.search.getSimple(session, [Source.GAR], '.*'),
      mediacentreService.favorites.get(session),
      mediacentreService.signets.get(session),
      mediacentreService.textbooks.get(session),
    ]);
    const resources = { externals, favorites, signets, textbooks };
    dispatch(resourcesActionsCreators.receipt(resources));
    return resources;
  } catch (e) {
    dispatch(resourcesActionsCreators.error(e as Error));
    throw e;
  }
};

export const fetchFavoritesActionsCreators = createAsyncActionCreators(actionTypes.fetchFavorites);
export const fetchFavoritesAction = (): ThunkAction<Promise<Resource[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(fetchFavoritesActionsCreators.request());
    const favorites = await mediacentreService.favorites.get(session);
    dispatch(fetchFavoritesActionsCreators.receipt(favorites));
    return favorites;
  } catch (e) {
    dispatch(fetchFavoritesActionsCreators.error(e as Error));
    throw e;
  }
};

export const addFavoriteActionsCreators = createAsyncActionCreators(actionTypes.addFavorite);
export const addFavoriteAction =
  (resourceId: string, resource: Resource): ThunkAction<Promise<void>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(addFavoriteActionsCreators.request());
      await mediacentreService.favorites.add(session, resourceId, resource);
      dispatch(fetchFavoritesActionsCreators.receipt(resourceId));
    } catch (e) {
      dispatch(addFavoriteActionsCreators.error(e as Error));
    }
  };

export const removeFavoriteActionsCreators = createAsyncActionCreators(actionTypes.removeFavorite);
export const removeFavoriteAction =
  (resourceId: string, source: Source): ThunkAction<Promise<void>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(removeFavoriteActionsCreators.request());
      await mediacentreService.favorites.remove(session, resourceId, source);
      dispatch(removeFavoriteActionsCreators.receipt(resourceId));
    } catch (e) {
      dispatch(removeFavoriteActionsCreators.error(e as Error));
    }
  };

export const searchActionsCreators = createAsyncActionCreators(actionTypes.search);
export const searchResourcesAction =
  (query: string): ThunkAction<Promise<Resource[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(searchActionsCreators.request());
      const resources = await mediacentreService.search.getSimple(session, [Source.GAR, Source.MOODLE, Source.SIGNET], query);
      dispatch(searchActionsCreators.receipt(resources));
      return resources;
    } catch (e) {
      dispatch(searchActionsCreators.error(e as Error));
      throw e;
    }
  };
