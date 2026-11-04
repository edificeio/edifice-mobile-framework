/**
 * Favorites: the preferences to save when they change. `applications` is given back as it is, without any check: the app doesn't use
 * it.
 */
import { AppsPreferences } from '~/modules/myapps/model';

/** Preferences with the app added to the favorites (at the end), or removed from them. */
export const withFavoriteToggled = ({ applications, favorites }: AppsPreferences, appName: string): AppsPreferences => ({
  applications,
  favorites: favorites.includes(appName) ? favorites.filter(name => name !== appName) : [...favorites, appName],
});

/** Preferences with all the favorites replaced. */
export const withFavorites = (preferences: AppsPreferences, favorites: string[]): AppsPreferences => ({
  applications: preferences.applications,
  favorites,
});

/**
 * Preferences with the favorites in a new order. The favorites that are not in it (apps not listed in « Mes applis ») are kept, at
 * the end: they must not be dropped.
 */
export const withFavoritesReordered = (preferences: AppsPreferences, orderedNames: string[]): AppsPreferences => ({
  applications: preferences.applications,
  favorites: [...orderedNames, ...preferences.favorites.filter(name => !orderedNames.includes(name))],
});
