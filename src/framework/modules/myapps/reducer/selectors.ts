import { IGlobalState } from '~/app/store';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AppsInfoAggregated, AppsInfoState } from '~/framework/modules/myapps/types';
import type { AppsPreferences, EntApp } from '~/modules/myapps/model';
import { MyAppsRootState, selectApps, selectPreferences } from '~/modules/myapps/store';
import { getAppTestID } from '~/modules/myapps/util';

/**
 * The old shape of an app, from the new one. What the old app had and the new one doesn't (module, prefix, target) is empty: only the
 * colors, the icon and the label are still read through here.
 */
const toLegacyApp = (app: EntApp, favorites: ReadonlySet<string>): AppsInfoAggregated => ({
  address: app.address,
  category: app.category,
  color: app.color as AppsInfoAggregated['color'],
  display: app.display,
  displayName: app.label,
  help: app.helpUrls,
  icon: app.icon,
  isConnector: false,
  isExternal: false,
  isFavorite: favorites.has(app.name),
  isLibrary: app.isLibrary,
  isMobile: false,
  name: app.name,
  prefix: '',
  target: null,
  testID: getAppTestID(app),
});

let cache: { apps: EntApp[]; preferences: AppsPreferences; state: AppsInfoState } | undefined;

/**
 * @deprecated only for the old code of `framework/modules/myapps` (removed in phase 7): read `src/modules/myapps` (`useEntApp`,
 * `useEntAppDisplay`…).
 * The state of the old module, built from the new one (`src/modules/myapps/store`). The same object is given while the new state
 * doesn't change.
 * ToDo(myapps-migration): remove with the old code (phase 7).
 */
export const selectAppsState = (state: IGlobalState): AppsInfoState => {
  if (!(state as Partial<MyAppsRootState>).myapps) return appsInfoInitialState;
  const apps = selectApps(state).data;
  const preferences = selectPreferences(state).data;
  if (cache?.apps !== apps || cache.preferences !== preferences) {
    const favorites = new Set(preferences.favorites);
    cache = {
      apps,
      preferences,
      state: {
        aggregatedApps: Object.fromEntries(apps.map(app => [app.name, toLegacyApp(app, favorites)])),
        appsConfig: [],
        appsInfo: [],
        favorites: { applications: preferences.applications, bookmarks: preferences.favorites },
      },
    };
  }
  return cache.state;
};
/** @deprecated only for the old code of `framework/modules/myapps`: read `useFavorites` of `src/modules/myapps`. */
export const selectAppBookmarks = (state: IGlobalState) => selectAppsState(state).favorites;
/** @deprecated only for the old code of `framework/modules/myapps`: read `useEntApp` of `src/modules/myapps`. */
export const selectAggregatedApps = (state: IGlobalState) => selectAppsState(state).aggregatedApps;
