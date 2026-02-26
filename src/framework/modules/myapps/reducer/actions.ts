import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  appsInfoActionTypes,
  checkIfIsConnector,
  computeNextBookmarks,
  isMobileApp,
  isNavigableModule,
  selectAppsState,
} from '~/framework/modules/myapps/reducer';
import { myAppsService } from '~/framework/modules/myapps/service';
import { MyAppsPreferencesStorageData, readMyAppsPreferences, writeShowAllApps } from '~/framework/modules/myapps/storage';
import { AppBookmarks, ApplicationsConfig, AppsInfo, AppsInfoState } from '~/framework/modules/myapps/types';
import { getModuleRouteName } from '~/framework/modules/myapps/utils';
import { IEntcoreApp } from '~/framework/util/moduleTool';

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

export const afterLoginSetup = (): ThunkResult => async dispatch => {
  dispatch(appInfoActions.fetchStart());
  const session = getSession();
  const modules = AllModules().filterAvailables(session!).filter(isNavigableModule);

  try {
    let [appsInfo, appsConfig, favorites] = await Promise.all([
      myAppsService.list(),
      myAppsService.config(),
      myAppsService.bookmarks(),
    ]);
    appsInfo = appsInfo.map(app => {
      const isMobile = isMobileApp(app as IEntcoreApp, modules);
      const isConnector = checkIfIsConnector(app);
      const routeName = isMobile ? getModuleRouteName(app as IEntcoreApp, modules) : undefined;
      return { ...app, isConnector, isMobile, routeName };
    });
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

export const toggleFavorite =
  (appName: string, onDone?: (ok: boolean) => void): ThunkResult =>
  async (dispatch, getState: () => AppsInfoState) => {
    const session = getSession();
    if (!session) return;

    const state = getState();
    const appsInfostate = selectAppsState(state);
    const { appsConfig, appsInfo, favorites } = appsInfostate;

    const nextBookmarks = computeNextBookmarks(favorites.bookmarks, appName).filter(name => favorites.applications.includes(name));

    const optimisticFavorites: AppBookmarks = {
      applications: favorites.applications,
      bookmarks: nextBookmarks,
    };

    dispatch(appInfoActions.toggleFavorite(appName));

    try {
      await myAppsService.updateBookmarks(optimisticFavorites);

      const refreshedFavorites = await myAppsService.bookmarks();

      dispatch(
        appInfoActions.fetchSuccess({
          appsConfig,
          appsInfo,
          favorites: refreshedFavorites,
        }),
      );

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
