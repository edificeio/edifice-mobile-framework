/**
 * Mediacentre actions
 */
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { MediacentreResources, Resource, Source } from '~/framework/modules/mediacentre/model';
import { actionTypes } from '~/framework/modules/mediacentre/reducer';
import { actions as favoritesActions } from '~/framework/modules/mediacentre/reducer/favorites';
import { mediacentreService } from '~/framework/modules/mediacentre/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const resourcesActionsCreators = createAsyncActionCreators(actionTypes.fetchResources);
export const fetchResourcesAction = (): ThunkAction<Promise<MediacentreResources>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(resourcesActionsCreators.request());
    const [externals, signets, textbooks] = await Promise.all([
      mediacentreService.search.getSimple(session, [Source.GAR], '.*'),
      mediacentreService.signets.get(session),
      mediacentreService.textbooks.get(session),
    ]);
    const resources = { externals, signets, textbooks };
    dispatch(resourcesActionsCreators.receipt(resources));
    return resources;
  } catch (e) {
    dispatch(resourcesActionsCreators.error(e as Error));
    throw e;
  }
};

export const fetchFavoritesAction = (): ThunkAction<Promise<Resource[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(favoritesActions.request());
    const favorites = await mediacentreService.favorites.get(session);
    dispatch(favoritesActions.receipt(favorites));
    return favorites;
  } catch (e) {
    dispatch(favoritesActions.error(e as Error));
  }
};

export const addFavoriteAction =
  (resource: Resource): ThunkAction<Promise<void>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(favoritesActions.addRequest());
      await mediacentreService.favorites.add(session, resource);
      dispatch(favoritesActions.addReceipt(resource));
    } catch (e) {
      dispatch(favoritesActions.addError(e as Error));
    }
  };

export const removeFavoriteAction =
  (resource: Resource): ThunkAction<Promise<void>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(favoritesActions.removeRequest());
      await mediacentreService.favorites.remove(session, resource.id, resource.source);
      dispatch(favoritesActions.removeReceipt(resource));
    } catch (e) {
      dispatch(favoritesActions.removeError(e as Error));
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
