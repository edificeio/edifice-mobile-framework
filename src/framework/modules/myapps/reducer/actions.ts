import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { isMobileApp, isNavigableModule } from './adapter';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { myAppsService } from '~/framework/modules/myapps/service';
import { AppBookmarks, ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';

export interface FetchStartAction extends Action {
  type: typeof appsInfoActionTypes.fetchStart;
}

export interface FetchSuccessAction extends Action {
  type: typeof appsInfoActionTypes.fetchSuccess;
  payload: AppsInfoActionPayloads['fetchSuccess'];
}

export interface FetchErrorAction extends Action {
  type: typeof appsInfoActionTypes.fetchError;
  error: string;
}

export const appsInfoActionTypes = {
  fetchError: moduleConfig.namespaceActionType('FETCH_ERROR'),
  fetchStart: moduleConfig.namespaceActionType('FETCH_START'),
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),
};

export const appInfoActions = {
  fetchError: (error: string) => ({ error, type: appsInfoActionTypes.fetchError }),
  fetchStart: () => ({ type: appsInfoActionTypes.fetchStart }),
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[]; favorites: AppBookmarks }) => ({
    payload,
    type: appsInfoActionTypes.fetchSuccess,
  }),
};

export const afterLoginSetup =
  (session): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> =>
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
        const isMobile = isMobileApp(app, navigableModules);
        return { ...app, isMobile };
      });

      dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, favorites }));
    } catch (e) {
      console.error('[afterLoginSetup] ERROR', e);
      dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
    }
  };

export const initMesAppliAtLogin = (): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> => async dispatch => {
  const session = getSession();
  if (!session) return;
  await dispatch(afterLoginSetup(assertSession()));
};
