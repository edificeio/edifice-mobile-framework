import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { setUpModulesAccess } from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { applyAppsToModules } from '~/framework/modules/myapps/applyAppsToModules';
import { buildAppsInfo } from '~/framework/modules/myapps/buildAppsInfo';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { myAppsService } from '~/framework/modules/myapps/service';
import { ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';
import { AnyNavigableModule, IEntcoreApp, NavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

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
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[]; entcoreApps: IEntcoreApp[] }) => ({
    payload,
    type: appsInfoActionTypes.fetchSuccess,
  }),
};

export const afterLoginSetup =
  (session): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> =>
  async dispatch => {
    dispatch(appInfoActions.fetchStart());

    try {
      const modules = setUpModulesAccess(session) as AnyNavigableModule[];
      const navigableModules = new NavigableModuleArray<AnyNavigableModule>(...modules.filter(m => m instanceof NavigableModule));

      const [entcoreApps, appsConfig, bookmarks] = await Promise.all([
        myAppsService.list(session),
        myAppsService.config(session),
        myAppsService.bookmarks(session),
      ]);

      const baseAppsInfo = buildAppsInfo(entcoreApps, bookmarks);

      const appsInfo: AppsInfo[] = baseAppsInfo.map(app => {
        const entcoreApp = entcoreApps.find(e => e.name === app.name);
        const isMobile =
          app.type === 'application' &&
          !!entcoreApp &&
          navigableModules.some(m => m.config.matchEntcoreApp?.(entcoreApp, entcoreApps));

        return { ...app, isMobile };
      });

      dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, entcoreApps }));

      applyAppsToModules(navigableModules, appsInfo);
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
