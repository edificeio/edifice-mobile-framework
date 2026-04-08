import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { appsInfoActionTypes, FetchSuccessPayload } from '~/framework/modules/myapps/reducer/action-types';
import {
  buildFetchSuccessPayload,
  computeNextBookmarks,
  enrichAppsWithModuleInfo,
  isNavigableModule,
} from '~/framework/modules/myapps/reducer/adapter';
import { selectAppsState } from '~/framework/modules/myapps/reducer/selectors';
import { myAppsService } from '~/framework/modules/myapps/service';
import { MyAppsPreferencesStorageData, readMyAppsPreferences, writeShowAllApps } from '~/framework/modules/myapps/storage';

type ThunkResult = ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction>;

export const appInfoActions = {
  fetchError: (error: string) => ({ error, type: appsInfoActionTypes.fetchError }) as const,

  fetchStart: () => ({ type: appsInfoActionTypes.fetchStart }) as const,

  fetchSuccess: (payload: FetchSuccessPayload) => ({ payload, type: appsInfoActionTypes.fetchSuccess }) as const,

  hydratePreferences: (payload: Partial<MyAppsPreferencesStorageData>) =>
    ({ payload, type: appsInfoActionTypes.hydratePreferences }) as const,

  saveGroupedFavoritesError: () => ({ type: appsInfoActionTypes.saveGroupedFavoritesError }) as const,

  saveGroupedFavoritesStart: () => ({ type: appsInfoActionTypes.saveGroupedFavoritesStart }) as const,

  saveGroupedFavoritesSuccess: (bookmarks: string[]) =>
    ({ bookmarks, type: appsInfoActionTypes.saveGroupedFavoritesSuccess }) as const,

  toggleFavorite: (appName: string) => ({ appName, type: appsInfoActionTypes.toggleFavorite }) as const,
};

export const toggleAllApps = (): ThunkResult => async (dispatch, getState) => {
  dispatch({ type: appsInfoActionTypes.toggleAllApps });
  const { showAllApps } = selectAppsState(getState());
  writeShowAllApps(showAllApps);
};

export const enrichAppsAtLogin = (): ThunkResult => async (dispatch, getState) => {
  dispatch(appInfoActions.fetchStart());
  const session = getSession();
  if (!session) return;

  const modules = AllModules().filterAvailables(session).filter(isNavigableModule);
  const currentState = selectAppsState(getState());

  try {
    const appsInfo = enrichAppsWithModuleInfo(currentState?.appsInfo ?? [], modules);
    const appsConfig = currentState?.appsConfig ?? [];
    const favorites = currentState?.favorites ?? { applications: [], bookmarks: [] };

    dispatch(appInfoActions.fetchSuccess(buildFetchSuccessPayload(appsInfo, appsConfig, favorites)));
  } catch (e) {
    console.error('[enrichAppsAtLogin] ERROR', e);
    dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
  }
};

export const refreshMyApps = (): ThunkResult => async (dispatch, _) => {
  dispatch(appInfoActions.fetchStart());
  const session = getSession();
  const modules = AllModules().filterAvailables(session!).filter(isNavigableModule);

  try {
    const [rawAppsInfo, appsConfig, favorites] = await Promise.all([
      myAppsService.list(),
      myAppsService.config(),
      myAppsService.bookmarks(),
    ]);

    const appsInfo = enrichAppsWithModuleInfo(rawAppsInfo, modules);
    dispatch(appInfoActions.fetchSuccess(buildFetchSuccessPayload(appsInfo, appsConfig, favorites)));
  } catch (e) {
    console.error('[refreshMyApps] ERROR', e);
    dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
  }
};

const bookmarksAreEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every(name => setA.has(name));
};

export const toggleFavorite =
  (appName: string, onDone?: (ok: boolean) => void): ThunkResult =>
  async (dispatch, getState: () => IGlobalState) => {
    const session = getSession();
    if (!session) return;

    const { appsConfig, appsInfo, favorites } = selectAppsState(getState());
    const computedNextBookmarks = computeNextBookmarks(favorites.bookmarks, appName);
    const nextBookmarks =
      favorites.applications?.length > 0
        ? computedNextBookmarks.filter(name => favorites.applications.includes(name))
        : computedNextBookmarks;

    dispatch(appInfoActions.toggleFavorite(appName));

    try {
      await myAppsService.updateBookmarks({
        applications: favorites.applications,
        bookmarks: nextBookmarks,
      });

      const refreshedFavorites = await myAppsService.bookmarks();
      const currentBookmarks = selectAppsState(getState()).favorites.bookmarks;

      if (!bookmarksAreEqual(currentBookmarks, refreshedFavorites.bookmarks)) {
        dispatch(appInfoActions.fetchSuccess(buildFetchSuccessPayload(appsInfo, appsConfig, refreshedFavorites)));
      }

      onDone?.(true);
    } catch (e) {
      console.error('Error updating favorites:', e);
      dispatch(appInfoActions.toggleFavorite(appName));
      onDone?.(false);
    }
  };

export const saveGroupedFavorites =
  (bookmarks: string[], onDone?: (ok: boolean) => void): ThunkResult =>
  async (dispatch, getState) => {
    const session = getSession();
    if (!session) return;

    const { appsConfig, appsInfo, favorites } = selectAppsState(getState());

    dispatch(appInfoActions.saveGroupedFavoritesStart());

    try {
      await myAppsService.updateBookmarks({ applications: favorites.applications, bookmarks });

      const refreshed = await myAppsService.bookmarks();

      dispatch(appInfoActions.fetchSuccess(buildFetchSuccessPayload(appsInfo, appsConfig, refreshed)));
      dispatch(appInfoActions.saveGroupedFavoritesSuccess(refreshed.bookmarks));

      onDone?.(true);
    } catch (e) {
      console.error('[saveGroupedFavorites] ERROR', e);
      dispatch(appInfoActions.saveGroupedFavoritesError());
      onDone?.(false);
    }
  };

export const hydrateMyAppsPreferences = (): ThunkResult => async dispatch => {
  const prefs = readMyAppsPreferences();
  dispatch(appInfoActions.hydratePreferences(prefs));
};
