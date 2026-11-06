/**
 * From the API format to the model, and back for what is saved. The rules applied are those of `model/`.
 */
import { AppsPreferences, EMPTY_PREFERENCES, EntApp } from '~/modules/myapps/model';
import { AppConfig, getAppCategory, getAppConfig, isLibrary, LIBRARY_CONFIG_APP_NAME } from '~/modules/myapps/model/classification';
import { getAppColor, getAppIcon, getAppLabel, Translate } from '~/modules/myapps/model/display';
import { isConnector } from '~/modules/myapps/model/opening';

import type { API } from './api';

// # Apps

/** The help URLs that are set. */
const toHelpUrls = (help: API.EntAppResponse['help']): Record<string, string> =>
  Object.fromEntries(Object.entries(help ?? {}).filter((entry): entry is [string, string] => !!entry[1]));

const toAppConfig = (response: API.EntAppResponse): AppConfig => ({
  category: response.category,
  color: response.color,
  helpUrls: toHelpUrls(response.help),
});

/** @param libraryConfig the config of the libraries (see `model/classification.ts`). */
export const toEntApp = (response: API.EntAppResponse, libraryConfig: AppConfig | undefined, translate: Translate): EntApp => {
  const address = response.address ?? '';
  const config = getAppConfig({ ...toAppConfig(response), address }, libraryConfig);
  return {
    address,
    category: getAppCategory(config.category),
    color: getAppColor(response.name, config.color),
    display: response.display,
    helpUrls: config.helpUrls,
    icon: getAppIcon(response),
    isConnector: isConnector({ ...response, address }),
    isLibrary: isLibrary({ address, category: response.category }),
    label: getAppLabel(response, translate),
    name: response.name,
  };
};

/**
 * The apps of `GET /api/me/applications`:
 * - all of them, listed (`display`) or not: other modules need those that are not;
 * - except `library-info`, which is the config of the libraries, not an app;
 * - in the order of the server (the screen sorts them).
 */
export const toEntApps = (responses: API.EntAppResponse[], translate: Translate): EntApp[] => {
  const libraryInfo = responses.find(response => response.name === LIBRARY_CONFIG_APP_NAME);
  const libraryConfig = libraryInfo ? toAppConfig(libraryInfo) : undefined;
  return responses
    .filter(response => response.name !== LIBRARY_CONFIG_APP_NAME)
    .map(response => toEntApp(response, libraryConfig, translate));
};

// # Preferences

/** Reads the `preference` field of `/userbook/preference/apps` (a JSON string): empty preferences if it is missing or unreadable. */
export const toPreferences = (preference: API.PreferencesResponse['preference']): AppsPreferences => {
  if (!preference) return EMPTY_PREFERENCES;
  try {
    const parsed = JSON.parse(preference) as API.Preferences | null;
    return {
      applications: Array.isArray(parsed?.applications) ? parsed.applications : [],
      favorites: Array.isArray(parsed?.bookmarks) ? parsed.bookmarks : [],
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
};

/** The preferences, as the server keeps them. */
export const fromPreferences = ({ applications, favorites }: AppsPreferences): API.Preferences => ({
  applications,
  bookmarks: favorites,
});
