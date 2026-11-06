/**
 * Favorites: the preferences to save when they change.
 *
 * Rule of the server, kept from the old module: `applications` is given back as it is. When it is not empty, a toggle keeps only the
 * favorites that are in it (and the app toggled).
 */
import { AppsPreferences } from '~/modules/myapps/model';

/** Preferences with the app added to the favorites, or removed from them. */
export const withFavoriteToggled = (preferences: AppsPreferences, appName: string): AppsPreferences => {
  const { applications, favorites } = preferences;
  const toggled = favorites.includes(appName) ? favorites.filter(name => name !== appName) : [...favorites, appName];
  return {
    applications,
    favorites: applications.length > 0 ? toggled.filter(name => applications.includes(name) || name === appName) : toggled,
  };
};

/** Preferences with all the favorites replaced. */
export const withFavorites = (preferences: AppsPreferences, favorites: string[]): AppsPreferences => ({
  applications: preferences.applications,
  favorites,
});
