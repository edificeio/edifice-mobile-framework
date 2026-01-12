import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import AllModules from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { buildAppsInfo } from '~/framework/modules/myapps/build-apps-info';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { myAppsService } from '~/framework/modules/myapps/service';
import { ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';
import { AnyModule, AnyNavigableModule, IEntcoreApp } from '~/framework/util/moduleTool';

function isNavigableModule(module: AnyModule): module is AnyNavigableModule {
  return typeof (module as AnyNavigableModule).getRoot === 'function';
}

function isConnectorApp(app: IEntcoreApp): boolean {
  return (
    app.isExternal === true || app.target === '_blank' || (typeof app.address === 'string' && /^https?:\/\//i.test(app.address))
  );
}

type ModuleWithEntcoreScope = {
  entcoreScope?: string[];
};

function isMobileApp(app: IEntcoreApp, modules: AnyNavigableModule[]): boolean {
  return modules.some(module => {
    const config = module.config as ModuleWithEntcoreScope;

    if (!config.entcoreScope || config.entcoreScope.length === 0) {
      return false;
    }

    return config.entcoreScope.some(scope => app?.prefix?.includes(scope) || app?.address?.includes(scope));
  });
}

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
      const [entcoreApps, appsConfig, bookmarks] = await Promise.all([
        myAppsService.list(session),
        myAppsService.config(session),
        myAppsService.bookmarks(session),
      ]);

      const baseAppsInfo = buildAppsInfo(entcoreApps, bookmarks);
      const navigableModules = AllModules().filter(isNavigableModule);

      const appsInfo: AppsInfo[] = baseAppsInfo.map(app => {
        const entcoreApp = entcoreApps.find(e => e.name === app.name);

        if (!entcoreApp) {
          return { ...app, isMobile: false, type: 'web' };
        }

        if (isConnectorApp(entcoreApp)) {
          return { ...app, isMobile: false, type: 'connector' };
        }

        if (isMobileApp(entcoreApp, navigableModules)) {
          return { ...app, isMobile: true, type: 'mobile' };
        }

        return { ...app, isMobile: false, type: 'web' };
      });

      dispatch(appInfoActions.fetchSuccess({ appsConfig, appsInfo, entcoreApps }));
      // applyAppsToModules(navigableModules, appsInfo);
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
