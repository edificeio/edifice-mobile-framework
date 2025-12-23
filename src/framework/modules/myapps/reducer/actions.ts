import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { applyAppsToModules } from '../applyAppsToModules';
import { selectAppsRaw } from './selectors';

import { setUpModulesAccess } from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { buildAppsInfo } from '~/framework/modules/myapps/buildAppsInfo';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';
import { AnyNavigableModule, IEntcoreApp, NavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';
import { signedFetch } from '~/infra/fetchWithCache';

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
  fetchError: (error: string) => ({
    error,
    type: appsInfoActionTypes.fetchError,
  }),
  fetchStart: () => ({
    type: appsInfoActionTypes.fetchStart,
  }),
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[]; entcoreApps: IEntcoreApp[] }) => ({
    payload,
    type: appsInfoActionTypes.fetchSuccess,
  }),
};

export const fetchAppsAction = (): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> => async dispatch => {
  dispatch(appInfoActions.fetchStart());

  try {
    const session = assertSession();

    const [appsRes, configRes, bookmarksRes] = await Promise.all([
      signedFetch(session.platform.url + '/applications-list'),
      signedFetch(session.platform.url + '/myApps/config'),
      signedFetch(session.platform.url + '/userbook/preference/apps'),
    ]);

    const entcoreAppsRaw = await appsRes.json();
    const entcoreApps = Array.isArray(entcoreAppsRaw) ? entcoreAppsRaw : (entcoreAppsRaw.applications ?? entcoreAppsRaw.apps ?? []);

    const appsConfig: ApplicationsConfig[] = await configRes.json();
    const bookmarks = JSON.parse((await bookmarksRes.json()).preference);

    const appsInfo = buildAppsInfo(entcoreApps, bookmarks);

    dispatch(
      appInfoActions.fetchSuccess({
        appsConfig,
        appsInfo,
        entcoreApps,
      }),
    );
  } catch (e) {
    console.error('[fetchAppsAction] ERROR', e);
    dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
  }
};

export const afterLoginSetup =
  (session): ThunkAction<void, IGlobalState, unknown, UnknownAction> =>
  (_, getState) => {
    const modules = setUpModulesAccess(session) as AnyNavigableModule[];

    const navigableModules = new NavigableModuleArray<AnyNavigableModule>(...modules.filter(m => m instanceof NavigableModule));

    const { appsInfo } = selectAppsRaw(getState());

    applyAppsToModules(navigableModules, appsInfo);
  };

export const initMesAppliAtLogin = (): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> => async dispatch => {
  const session = getSession();
  if (!session) return;

  await dispatch(fetchAppsAction());
  dispatch(afterLoginSetup(session));
};
