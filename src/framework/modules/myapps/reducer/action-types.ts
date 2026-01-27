import { Action } from 'redux';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppBookmarks, AppsInfoActionPayloads } from '~/framework/modules/myapps/types';

/* =========================
 * FETCH
 * ========================= */
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

/* =========================
 * FAVORITES – UNITAIRE
 * ========================= */
export interface ToggleFavoriteAction extends Action {
  type: typeof appsInfoActionTypes.toggleFavorite;
  appName: string;
}

/* =========================
 * FAVORITES – GROUPÉ
 * ========================= */
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

/* =========================
 * UI
 * ========================= */
export interface ToggleAllAppsAction extends Action {
  type: typeof appsInfoActionTypes.toggleAllApps;
}

/* =========================
 * UNION
 * ========================= */
export type MyAppsActions =
  | FetchStartAction
  | FetchSuccessAction
  | FetchErrorAction
  | ToggleFavoriteAction
  | SaveGroupedFavoritesStartAction
  | SaveGroupedFavoritesSuccessAction
  | SaveGroupedFavoritesErrorAction
  | ToggleAllAppsAction;

/* =========================
 * ACTION TYPES
 * ========================= */
export const appsInfoActionTypes = {
  fetchError: moduleConfig.namespaceActionType('FETCH_ERROR'),
  fetchStart: moduleConfig.namespaceActionType('FETCH_START'),
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),

  saveGroupedFavoritesError: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_ERROR'),

  saveGroupedFavoritesStart: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_START'),
  saveGroupedFavoritesSuccess: moduleConfig.namespaceActionType('SAVE_GROUPED_FAVORITES_SUCCESS'),
  toggleAllApps: moduleConfig.namespaceActionType('TOGGLE_ALL_APPS'),

  toggleFavorite: moduleConfig.namespaceActionType('TOGGLE_FAVORITE'),
};
