import { Action } from 'redux';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppsInfoActionPayloads } from '~/framework/modules/myapps/types';

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
export interface ToggleFavoriteAction extends Action {
  type: typeof appsInfoActionTypes.toggleFavorite;
  appName: string;
}

export type MyAppsActions = FetchStartAction | FetchSuccessAction | FetchErrorAction | ToggleFavoriteAction;

export const appsInfoActionTypes = {
  fetchError: moduleConfig.namespaceActionType('FETCH_ERROR'),
  fetchStart: moduleConfig.namespaceActionType('FETCH_START'),
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),
  toggleFavorite: moduleConfig.namespaceActionType('TOGGLE_FAVORITE'),
};
