import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { myAppsModules, myAppsSecondaryModules } from '~/framework/modules/myAppMenu/myAppsModules';
import { buildAppsInfo } from '~/framework/modules/myapps/build-apps-info';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { myAppsService } from '~/framework/modules/myapps/service';
import { ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';
import { IEntcoreApp, NavigableModuleArray } from '~/framework/util/moduleTool';

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
      const allmodules = AllModules();
      const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(session));
      const secondaryModules = new NavigableModuleArray(...myAppsSecondaryModules.get().filterAvailables(session));

      const [entcoreApps, appsConfig, bookmarks] = await Promise.all([
        myAppsService.list(session),
        myAppsService.config(session),
        myAppsService.bookmarks(session),
      ]);

      const baseAppsInfo = buildAppsInfo(entcoreApps, bookmarks);
      // const allmdules = AllModules().map(m => m.config);

      /**
       *  we must check if one of the entcoreApps is present in modules
       * or secondaryModules to make it mobile if not its a connector
       */
      const appsInfo: AppsInfo[] = baseAppsInfo.map(app => {
        const entcoreApp = entcoreApps.find(e => e.name === app.name);
        const isMobile = !!entcoreApp && allmodules.some(m => m.config.matchEntcoreApp?.(entcoreApp, entcoreApps));
        // const isMM = allmodules.map(m => m.config).forEach(config => config.name === app.name);

        return { ...app, isMobile };
      });

      console.debug({ appsConfig, appsInfo, bookmarks, entcoreApps, modules, secondaryModules });
      dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, entcoreApps }));

      // applyAppsToModules(modules, appsInfo);
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
