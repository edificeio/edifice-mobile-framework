import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  appsInfoActionTypes,
  computeNextBookmarks,
  enrichAppsWithModuleInfo,
  isNavigableModule,
  selectAppsState,
} from '~/framework/modules/myapps/reducer';
import { myAppsService } from '~/framework/modules/myapps/service';
import { MyAppsPreferencesStorageData, readMyAppsPreferences, writeShowAllApps } from '~/framework/modules/myapps/storage';
import { AppBookmarks, ApplicationsConfig, AppsInfo, AppsInfoState } from '~/framework/modules/myapps/types';

type ThunkResult = ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction>;

export const appInfoActions = {
  fetchError: (error: string) =>
    ({
      error,
      type: appsInfoActionTypes.fetchError,
    }) as const,
  fetchStart: () => ({ type: appsInfoActionTypes.fetchStart }) as const,
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[]; favorites: AppBookmarks }) =>
    ({
      payload,
      type: appsInfoActionTypes.fetchSuccess,
    }) as const,

  hydratePreferences: (payload: Partial<MyAppsPreferencesStorageData>) =>
    ({
      payload,
      type: appsInfoActionTypes.hydratePreferences,
    }) as const,

  saveGroupedFavoritesError: () =>
    ({
      type: appsInfoActionTypes.saveGroupedFavoritesError,
    }) as const,

  saveGroupedFavoritesStart: () =>
    ({
      type: appsInfoActionTypes.saveGroupedFavoritesStart,
    }) as const,

  saveGroupedFavoritesSuccess: (bookmarks: string[]) =>
    ({
      bookmarks,
      type: appsInfoActionTypes.saveGroupedFavoritesSuccess,
    }) as const,

  toggleFavorite: (appName: string) =>
    ({
      appName,
      type: appsInfoActionTypes.toggleFavorite,
    }) as const,
};

export const toggleAllApps = (): ThunkResult => async (dispatch, getState) => {
  dispatch({ type: appsInfoActionTypes.toggleAllApps });

  const { showAllApps } = selectAppsState(getState());
  writeShowAllApps(showAllApps);
};

export const afterLoginSetup = (): ThunkResult => async (dispatch, getState) => {
  dispatch(appInfoActions.fetchStart());
  const session = getSession();
  const modules = AllModules().filterAvailables(session!).filter(isNavigableModule);
  const currentState = selectAppsState(getState());

  try {
    let appsInfo = currentState?.appsInfo || [];
    let appsConfig = currentState?.appsConfig || [];
    let favorites = currentState?.favorites || { applications: [], bookmarks: [] };

    appsInfo = enrichAppsWithModuleInfo(appsInfo, modules);
    dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, favorites }));
  } catch (e) {
    console.error('[afterLoginSetup] ERROR', e);
    dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
  }
};

export const initMesAppliAtLogin = (): ThunkResult => async dispatch => {
  const session = getSession();
  if (!session) return;
  await dispatch(afterLoginSetup());
};

export const refreshMyApps = (): ThunkResult => async (dispatch, _) => {
  dispatch(appInfoActions.fetchStart());
  const session = getSession();
  const modules = AllModules().filterAvailables(session!).filter(isNavigableModule);

  try {
    let [appsInfo, appsConfig, favorites] = await Promise.all([
      myAppsService.list(),
      myAppsService.config(),
      myAppsService.bookmarks(),
    ]);

    appsInfo = enrichAppsWithModuleInfo(appsInfo, modules);
    dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, favorites }));
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
  async (dispatch, getState: () => AppsInfoState) => {
    const session = getSession();
    if (!session) return;

    const state = getState();
    const appsInfostate = selectAppsState(state);
    const { appsConfig, appsInfo, favorites } = appsInfostate;

    const computedNextBookmarks = computeNextBookmarks(favorites.bookmarks, appName);

    const nextBookmarks =
      favorites.applications && favorites.applications.length > 0
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
        dispatch(
          appInfoActions.fetchSuccess({
            appsConfig,
            appsInfo,
            favorites: refreshedFavorites,
          }),
        );
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

    const state = getState();
    const { appsConfig, appsInfo, favorites } = selectAppsState(state);

    const payload: AppBookmarks = {
      applications: favorites.applications,
      bookmarks,
    };

    dispatch(appInfoActions.saveGroupedFavoritesStart());

    try {
      await myAppsService.updateBookmarks(payload);

      const refreshed = await myAppsService.bookmarks();

      dispatch(
        appInfoActions.fetchSuccess({
          appsConfig,
          appsInfo,
          favorites: refreshed,
        }),
      );

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
