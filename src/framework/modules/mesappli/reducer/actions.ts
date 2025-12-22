import { Action, UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { applyAppsToModules } from '../applyAppsToModules';
import { selectAggregatedApps } from './selectors';

import { setUpModulesAccess } from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { buildAppsInfo } from '~/framework/modules/mesappli/buildAppsInfo';
import moduleConfig from '~/framework/modules/mesappli/module-config';
import { ApplicationsConfig, AppsInfo, AppsInfoActionPayloads } from '~/framework/modules/mesappli/types';
import { loadModules, NavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';
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
  fetchSuccess: (payload: { appsInfo: AppsInfo[]; appsConfig: ApplicationsConfig[] }) => ({
    payload,
    type: appsInfoActionTypes.fetchSuccess,
  }),
};

export const fetchAppsAction = (): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> => async dispatch => {
  console.debug('[fetchAppsAction] start');
  dispatch(appInfoActions.fetchStart());

  try {
    const session = assertSession();
    console.debug('[fetchAppsAction] session ok', {
      platform: session.platform?.url,
      userId: session.user?.id,
    });
    const [appsRes, configRes, bookmarksRes] = await Promise.all([
      signedFetch(session.platform.url + '/applications-list'),
      signedFetch(session.platform.url + '/myApps/config'),
      signedFetch(session.platform.url + '/userbook/preference/apps'),
    ]);

    console.debug('[fetchAppsAction] responses', {
      apps: {
        contentType: appsRes.headers.get('content-type'),
        ok: appsRes.ok,
        status: appsRes.status,
        url: appsRes.url,
      },
      bookmarks: {
        contentType: bookmarksRes.headers.get('content-type'),
        ok: bookmarksRes.ok,
        status: bookmarksRes.status,
        url: bookmarksRes.url,
      },
      config: {
        contentType: configRes.headers.get('content-type'),
        ok: configRes.ok,
        status: configRes.status,
        url: configRes.url,
      },
    });

    console.debug('[fetchAppsAction] fetch done', {
      appsStatus: appsRes.status,
      bookmarksStatus: bookmarksRes.status,
      configStatus: configRes.status,
    });

    const entcoreAppsRaw = await appsRes.json();

    const entcoreApps = Array.isArray(entcoreAppsRaw) ? entcoreAppsRaw : (entcoreAppsRaw.applications ?? entcoreAppsRaw.apps ?? []);

    console.debug('[fetchAppsAction] entcoreApps normalized', {
      count: entcoreApps.length,
      sample: entcoreApps,
    });

    const appsConfig: ApplicationsConfig[] = await configRes.json();
    console.debug('[fetchAppsAction] appsConfig', {
      count: appsConfig?.length,
      sample: appsConfig?.slice?.(0, 3),
    });

    const bookmarksRaw = await bookmarksRes.json();
    console.debug('[fetchAppsAction] bookmarksRaw', bookmarksRaw);

    const bookmarks = JSON.parse(bookmarksRaw.preference);
    console.debug('[fetchAppsAction] bookmarks parsed', bookmarks);

    const modules = loadModules([]);
    const appsInfo = buildAppsInfo(entcoreApps, bookmarks, modules);
    console.debug('[fetchAppsAction] appsInfo built', {
      count: appsInfo.length,
      sample: appsInfo.slice(0, 3),
    });
    //.slice(0, 3)
    console.debug('[fetchAppsAction] dispatching', {
      type: appsInfoActionTypes.fetchSuccess,
    });
    dispatch(
      appInfoActions.fetchSuccess({
        appsConfig,
        appsInfo,
      }),
    );

    console.debug('[fetchAppsAction] SUCCESS dispatched');
  } catch (e) {
    console.error('[fetchAppsAction] ERROR', e);
    dispatch(appInfoActions.fetchError('APPS_FETCH_ERROR'));
  }
};

export const afterLoginSetup = session => (dispatch, getState) => {
  const modules = setUpModulesAccess(session);

  const state = getState();
  const apps = selectAggregatedApps(state);

  const moduleNames = new Set(modules.map(m => m.config.name));

  const appsWithType = apps.map(app => {
    if (moduleNames.has(app.name)) {
      return { ...app, type: 'mobile' as const };
    }
    return app;
  });

  const navigableModules = new NavigableModuleArray(...modules.filter(m => m instanceof NavigableModule));

  applyAppsToModules(navigableModules, appsWithType);

  console.debug('[afterLoginSetup] apps typed', {
    connector: appsWithType.filter(a => a.type === 'connector').length,
    mobile: appsWithType.filter(a => a.type === 'mobile').length,
    mobileSample: appsWithType
      .filter(a => a.type === 'mobile')
      .slice(0, 5)
      .map(a => a.name),
    total: appsWithType.length,
    web: appsWithType.filter(a => a.type === 'web').length,
  });
};

export const initMesAppliAtLogin = (): ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction> => async (dispatch, _) => {
  const session = getSession();
  if (!session) return;

  await dispatch(fetchAppsAction());
  dispatch(afterLoginSetup(session));
};
