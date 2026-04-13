import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { appsInfoActionTypes, FetchSuccessPayload } from '~/framework/modules/myapps/reducer/action-types';
import { computeNextBookmarks, loadAppsDataFromService } from '~/framework/modules/myapps/reducer/adapter';
import { selectAppsState } from '~/framework/modules/myapps/reducer/selectors';
import { myAppsService } from '~/framework/modules/myapps/service';
import { MyAppsPreferencesStorageData, readMyAppsPreferences, writeShowAllApps } from '~/framework/modules/myapps/storage';

type ThunkResult = ThunkAction<Promise<void>, IGlobalState, unknown, UnknownAction>;

export const appInfoActions = {
  fetchSuccess: (payload: FetchSuccessPayload) => ({ payload, type: appsInfoActionTypes.fetchSuccess }) as const,

  hydratePreferences: (payload: Partial<MyAppsPreferencesStorageData>) =>
    ({ payload, type: appsInfoActionTypes.hydratePreferences }) as const,

  updateFavorites: (bookmarks: string[]) => ({ bookmarks, type: appsInfoActionTypes.updateFavorites }) as const,
};

export const toggleAllApps = (): ThunkResult => async (dispatch, getState) => {
  dispatch({ type: appsInfoActionTypes.toggleAllApps });
  const { showAllApps } = selectAppsState(getState());
  writeShowAllApps(showAllApps);
};

export const refreshMyApps = (): ThunkResult => async (dispatch, _) => {
  const session = getSession();

  try {
    const payload = await loadAppsDataFromService(myAppsService, session);
    dispatch(appInfoActions.fetchSuccess(payload));
  } catch (e) {
    console.error('[refreshMyApps] ERROR', e);
  }
};

export const toggleFavorite =
  (appName: string, onDone?: (ok: boolean) => void): ThunkResult =>
  async (dispatch, getState: () => IGlobalState) => {
    const session = getSession();
    if (!session) return;

    const { favorites } = selectAppsState(getState());
    const computedNextBookmarks = computeNextBookmarks(favorites.bookmarks, appName);
    const nextBookmarks =
      favorites.applications?.length > 0
        ? computedNextBookmarks.filter(name => favorites.applications.includes(name))
        : computedNextBookmarks;

    try {
      await myAppsService.updateBookmarks({
        applications: favorites.applications,
        bookmarks: nextBookmarks,
      });

      // Only update state AFTER successful API call
      dispatch(appInfoActions.updateFavorites(nextBookmarks));
      onDone?.(true);
    } catch (e) {
      console.error('Error updating favorites:', e);
      onDone?.(false);
    }
  };

export const saveGroupedFavorites =
  (bookmarks: string[], onDone?: (ok: boolean) => void): ThunkResult =>
  async (dispatch, getState) => {
    const session = getSession();
    if (!session) return;

    const { favorites } = selectAppsState(getState());

    dispatch(appInfoActions.updateFavorites(bookmarks));

    try {
      await myAppsService.updateBookmarks({ applications: favorites.applications, bookmarks });

      dispatch(appInfoActions.updateFavorites(bookmarks));
      onDone?.(true);
    } catch (e) {
      console.error('[saveGroupedFavorites] ERROR', e);
      dispatch(appInfoActions.updateFavorites(favorites.bookmarks));
      onDone?.(false);
    }
  };

export const hydrateMyAppsPreferences = (): ThunkResult => async dispatch => {
  const prefs = readMyAppsPreferences();
  dispatch(appInfoActions.hydratePreferences(prefs));
};
