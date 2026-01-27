import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import Toast from '~/framework/components/toast';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import {
  appsInfoActionTypes,
  computeNextBookmarks,
  isMobileApp,
  isNavigableModule,
  selectAppsState,
} from '~/framework/modules/myapps/reducer';
import { myAppsService } from '~/framework/modules/myapps/service';
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

  toggleAllApps: () =>
    ({
      type: appsInfoActionTypes.toggleAllApps,
    }) as const,

  toggleFavorite: (appName: string) =>
    ({
      appName,
      type: appsInfoActionTypes.toggleFavorite,
    }) as const,
};
export const afterLoginSetup =
  (session): ThunkResult =>
  async dispatch => {
    dispatch(appInfoActions.fetchStart());
    const modules = AllModules().filter(isNavigableModule);

    try {
      let [appsInfo, appsConfig, favorites] = await Promise.all([
        myAppsService.list(session),
        myAppsService.config(session),
        myAppsService.bookmarks(session),
      ]);
      appsInfo = appsInfo.map(app => {
        const isMobile = isMobileApp(app as IEntcoreApp, modules);
        const routeName = isMobile ? getModuleRouteName(app as IEntcoreApp, modules) : undefined;
        return { ...app, isMobile, routeName };
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
  await dispatch(afterLoginSetup(assertSession()));
};

export const toggleFavorite =
  (appName: string): ThunkResult =>
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
      await myAppsService.updateBookmarks(session, optimisticFavorites);

      const refreshedFavorites = await myAppsService.bookmarks(session);

      dispatch(
        appInfoActions.fetchSuccess({
          appsConfig,
          appsInfo,
          favorites: refreshedFavorites,
        }),
      );

      Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
    } catch (e) {
      console.error('Error updating favorites:', e);
      dispatch(appInfoActions.toggleFavorite(appName));
      Toast.showError(I18n.get('myapp-add-favorite-error-message'));
    }
  };

export const saveGroupedFavorites =
  (bookmarks: string[]): ThunkResult =>
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
      await myAppsService.updateBookmarks(session, payload);

      const refreshed = await myAppsService.bookmarks(session);

      dispatch(
        appInfoActions.fetchSuccess({
          appsConfig,
          appsInfo,
          favorites: refreshed,
        }),
      );

      dispatch(appInfoActions.saveGroupedFavoritesSuccess(refreshed.bookmarks));

      Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
    } catch (e) {
      console.error('[saveGroupedFavorites] ERROR', e);
      dispatch(appInfoActions.saveGroupedFavoritesError());
      Toast.showError(I18n.get('myapp-add-favorite-error-message'));
    }
  };
