/**
 * What the user does in « Mes applis »: load the apps again, change the favorites. Each action goes through the service, then puts
 * the result in the store (`store/`, which only holds the Redux state, actions and selectors).
 */
import type { ThunkAction } from 'redux-thunk';

import { getSession } from '~/modules/auth/store/accounts';
import type { AppsPreferences } from '~/modules/myapps/model';
import type { Translate } from '~/modules/myapps/model/display';
import { withFavorites, withFavoriteToggled } from '~/modules/myapps/model/favorites';
import { myAppsService } from '~/modules/myapps/service';
import { MyAppsAction, myAppsActions, MyAppsRootState, selectPreferences } from '~/modules/myapps/store';

type MyAppsThunk<Result> = ThunkAction<Promise<Result>, MyAppsRootState, unknown, MyAppsAction>;

const requireSession = () => {
  const session = getSession();
  if (!session) throw new Error('[MyApps] No session');
  return session;
};

/**
 * Loads the apps and the preferences again (pull-to-refresh, « retry »). Each one that fails keeps its data, with an `error` status.
 * @param translate translates the labels of the apps (`I18n.get`).
 * @returns whether both were loaded.
 */
export const refreshMyApps =
  ({ translate }: { translate: Translate }): MyAppsThunk<boolean> =>
  async dispatch => {
    const session = requireSession();
    const [apps, preferences] = await Promise.allSettled([
      myAppsService.apps(session, { translate }),
      myAppsService.preferences.get(session),
    ]);
    if (apps.status === 'fulfilled') dispatch(myAppsActions.appsLoaded(apps.value));
    else {
      console.error('[MyApps] Failed to load the apps', apps.reason);
      dispatch(myAppsActions.appsFailed());
    }
    if (preferences.status === 'fulfilled') dispatch(myAppsActions.preferencesLoaded(preferences.value));
    else {
      console.error('[MyApps] Failed to load the preferences', preferences.reason);
      dispatch(myAppsActions.preferencesFailed());
    }
    return apps.status === 'fulfilled' && preferences.status === 'fulfilled';
  };

/**
 * Saves the preferences computed from the current ones, then (only once saved) puts them in the state.
 * The current ones are read from the server if the state doesn't have them: saving from empty ones would erase the favorites.
 * Throws if they can't be saved: the state doesn't change.
 */
const savePreferences =
  (update: (preferences: AppsPreferences) => AppsPreferences): MyAppsThunk<void> =>
  async (dispatch, getState) => {
    const session = requireSession();
    const loaded = selectPreferences(getState());
    const current = loaded.status === 'loaded' ? loaded.data : await myAppsService.preferences.get(session);
    const next = update(current);
    await myAppsService.preferences.put(session, next);
    dispatch(myAppsActions.preferencesLoaded(next));
  };

/** Adds an app to the favorites, or removes it (see `withFavoriteToggled`). Throws if it can't be saved. */
export const toggleFavorite = (appName: string) => savePreferences(preferences => withFavoriteToggled(preferences, appName));

/** Replaces all the favorites. Throws if they can't be saved. */
export const saveFavorites = (favorites: string[]) => savePreferences(preferences => withFavorites(preferences, favorites));
