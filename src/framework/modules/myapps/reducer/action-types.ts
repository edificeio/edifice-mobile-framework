import { Action } from 'redux';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppBookmarks, ApplicationsConfig, AppsInfo } from '~/framework/modules/myapps/types';

export interface FetchStartAction extends Action {
  type: typeof appsInfoActionTypes.fetchStart;
}

export interface FetchSuccessAction extends Action {
  type: typeof appsInfoActionTypes.fetchSuccess;
  payload: {
    appsInfo: AppsInfo[];
    appsConfig: ApplicationsConfig[];
    favorites: AppBookmarks;
  };
}

export interface FetchErrorAction extends Action {
  type: typeof appsInfoActionTypes.fetchError;
  error: string;
}
export interface ToggleFavoriteAction extends Action {
  type: typeof appsInfoActionTypes.toggleFavorite;
  appName: string;
}

export interface SaveGroupedFavoritesStartAction extends Action {
  type: typeof appsInfoActionTypes.saveGroupedFavoritesStart;
}

export interface SaveGroupedFavoritesSuccessAction extends Action {
  type: typeof appsInfoActionTypes.saveGroupedFavoritesSuccess;
  bookmarks: AppBookmarks['bookmarks'];
}

export interface SaveGroupedFavoritesErrorAction extends Action {
  type: typeof appsInfoActionTypes.saveGroupedFavoritesError;
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

export type MyAppsActions =
  | FetchStartAction
  | FetchSuccessAction
  | FetchErrorAction
  | ToggleFavoriteAction
  | SaveGroupedFavoritesStartAction
  | SaveGroupedFavoritesSuccessAction
  | SaveGroupedFavoritesErrorAction
  | ToggleAllAppsAction
  | HydratePreferencesAction;

export const appsInfoActionTypes = {
  fetchError: moduleConfig.namespaceActionType('FETCH_ERROR'),
  fetchStart: moduleConfig.namespaceActionType('FETCH_START'),
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),

  hydratePreferences: moduleConfig.namespaceActionType('HYDRATE_PREFERENCES'),

  saveGroupedFavoritesError: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_ERROR'),
  saveGroupedFavoritesStart: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_START'),
  saveGroupedFavoritesSuccess: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_SUCCESS'),

  toggleAllApps: moduleConfig.namespaceActionType('TOGGLE_ALL_APPS'),
  toggleFavorite: moduleConfig.namespaceActionType('TOGGLE_FAVORITE'),
};
