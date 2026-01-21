import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { appsInfoActionTypes } from './action-types';
import { computeNextBookmarks, isMobileApp, isNavigableModule } from './adapter';
import { selectAppsState } from './selectors';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import Toast from '~/framework/components/toast';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { myAppsService } from '~/framework/modules/myapps/service';
import { AppBookmarks, ApplicationsConfig, AppsInfo, AppsInfoState } from '~/framework/modules/myapps/types';
import { IEntcoreApp } from '~/framework/util/moduleTool';

type ThunkResult = ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction>;

export const appInfoActions = {
  fetchError: (error: string) => ({ error, type: appsInfoActionTypes.fetchError }),
  fetchStart: () => ({ type: appsInfoActionTypes.fetchStart }),
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[]; favorites: AppBookmarks }) => ({
    payload,
    type: appsInfoActionTypes.fetchSuccess,
  }),
  toggleFavorite: (appName: string) => ({ appName, type: appsInfoActionTypes.toggleFavorite }),
};

export const afterLoginSetup =
  (session): ThunkResult =>
  async dispatch => {
    dispatch(appInfoActions.fetchStart());
    const navigableModules = AllModules().filter(isNavigableModule);

    try {
      let [appsInfo, appsConfig, favorites] = await Promise.all([
        myAppsService.list(session),
        myAppsService.config(session),
        myAppsService.bookmarks(session),
      ]);
      appsInfo = appsInfo.map(app => {
        const isMobile = isMobileApp(app as IEntcoreApp, navigableModules);
        return { ...app, isMobile };
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

      Toast.showSuccess('Vos modifications ont bien été enregistrées');
    } catch (e) {
      console.error('Error updating favorites:', e);
      dispatch(appInfoActions.toggleFavorite(appName));
      Toast.showError('Une erreur est survenue lors de la mise à jour des favoris');
    }
  };
