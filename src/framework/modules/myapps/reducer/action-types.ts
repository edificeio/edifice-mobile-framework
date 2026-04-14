import { Action } from 'redux';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppBookmarks, ApplicationsConfig, AppsInfo, AppsInfoAggregated } from '~/framework/modules/myapps/types';

export type FetchSuccessPayload = {
  aggregatedApps: Record<string, AppsInfoAggregated>;
  appsInfo: AppsInfo[];
  appsConfig: ApplicationsConfig[];
  favorites: AppBookmarks;
};
export interface FetchSuccessAction extends Action {
  type: typeof appsInfoActionTypes.fetchSuccess;
  payload: FetchSuccessPayload;
}
export interface UpdateFavoritesAction extends Action {
  type: typeof appsInfoActionTypes.updateFavorites;
  bookmarks: string[];
}

export interface ToggleAllAppsAction extends Action {
  type: typeof appsInfoActionTypes.toggleAllApps;
}

export interface HydratePreferencesAction extends Action {
  type: typeof appsInfoActionTypes.hydratePreferences;
  payload: {
    showAllApps: boolean;
  };
}

export type MyAppsActions = FetchSuccessAction | UpdateFavoritesAction | ToggleAllAppsAction | HydratePreferencesAction;

export const appsInfoActionTypes = {
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),

  hydratePreferences: moduleConfig.namespaceActionType('HYDRATE_PREFERENCES'),

  toggleAllApps: moduleConfig.namespaceActionType('TOGGLE_ALL_APPS'),
  updateFavorites: moduleConfig.namespaceActionType('UPDATE_FAVORITES'),
};
