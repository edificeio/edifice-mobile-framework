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

export const appsInfoActionTypes = {
  fetchSuccess: moduleConfig.namespaceActionType('FETCH_SUCCESS'),

  updateFavorites: moduleConfig.namespaceActionType('UPDATE_FAVORITES'),
};
