/**
 * Mediacentre actions
 */
import { assertSession } from '~/framework/modules/auth/reducer';
import { IResource, Source, actionTypes } from '~/framework/modules/mediacentre/reducer';
import { compareResources, mediacentreService } from '~/framework/modules/mediacentre/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the external resources.
 */
export const externalsActionsCreators = createAsyncActionCreators(actionTypes.externals);
export const fetchExternalsAction = (sources: string[]) => async (dispatch, getState) => {
  if (!sources.includes(Source.GAR)) {
    return;
  }
  try {
    const session = assertSession();
    dispatch(externalsActionsCreators.request());
    const externals = await mediacentreService.search.getSimple(session, [Source.GAR], '.*');
    dispatch(externalsActionsCreators.receipt(externals));
    return externals;
  } catch (e) {
    dispatch(externalsActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch the favorites.
 */
export const fetchFavoritesActionsCreators = createAsyncActionCreators(actionTypes.fetchFavorites);
export const fetchFavoritesAction = () => async (dispatch, getState) => {
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

/**
 * Add the resource with specified id as favorite.
 */
export const addFavoriteActionsCreators = createAsyncActionCreators(actionTypes.addFavorite);
export const addFavoriteAction = (resourceId: string, resource: IResource) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(addFavoriteActionsCreators.request());
    await mediacentreService.favorites.add(session, resourceId, resource);
    dispatch(fetchFavoritesActionsCreators.receipt(resourceId));
  } catch (e) {
    dispatch(addFavoriteActionsCreators.error(e as Error));
  }
};

/**
 * Remove the resource with specified id from favorites.
 */
export const removeFavoriteActionsCreators = createAsyncActionCreators(actionTypes.removeFavorite);
export const removeFavoriteAction = (resourceId: string, source: Source) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(removeFavoriteActionsCreators.request());
    await mediacentreService.favorites.remove(session, resourceId, source);
    dispatch(removeFavoriteActionsCreators.receipt(resourceId));
  } catch (e) {
    dispatch(removeFavoriteActionsCreators.error(e as Error));
  }
};

/**
 * Search resources by title.
 */
export const searchActionsCreators = createAsyncActionCreators(actionTypes.search);
export const searchResourcesAction = (sources: string[], query: string) => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(searchActionsCreators.request());
    const resources = await mediacentreService.search.getSimple(session, sources, query);
    if (sources.includes(Source.SIGNET)) {
      const signets = await mediacentreService.signets.searchSimple(session, query);
      signets.forEach(signet => {
        if (!resources.find(resource => String(resource.id) === String(signet.id))) {
          resources.push(signet);
        }
      });
      resources.sort(compareResources);
    }
    dispatch(searchActionsCreators.receipt(resources));
    return resources;
  } catch (e) {
    dispatch(searchActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch the signets.
 */
export const signetsActionsCreators = createAsyncActionCreators(actionTypes.signets);
export const fetchSignetsAction = () => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(signetsActionsCreators.request());
    const shared = await mediacentreService.signets.get(session);
    const orientation = await mediacentreService.signets.getOrientation(session);
    dispatch(signetsActionsCreators.receipt({ orientation, shared }));
    return { orientation, shared };
  } catch (e) {
    dispatch(signetsActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch the textbooks.
 */
export const textbooksActionsCreators = createAsyncActionCreators(actionTypes.textbooks);
export const fetchTextbooksAction = () => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(textbooksActionsCreators.request());
    const textbooks = await mediacentreService.textbooks.get(session);
    dispatch(textbooksActionsCreators.receipt(textbooks));
    return textbooks;
  } catch (e) {
    dispatch(textbooksActionsCreators.error(e as Error));
    throw e;
  }
};
