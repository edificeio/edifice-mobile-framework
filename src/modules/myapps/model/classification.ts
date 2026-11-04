/**
 * How the apps are sorted out: categories, libraries, other services, and the filters of the list of « Mes applis ».
 */
import { APP_CATEGORIES, AppCategory, AppConfig, EntApp, ListedApp, MyAppsFilter } from '~/modules/myapps/model';
import { normalizeString } from '~/modules/myapps/util';

// # Category

/** The category of the server when the app knows it, else `other`. */
export const getAppCategory = (category: string | undefined): AppCategory =>
  (APP_CATEGORIES as readonly string[]).includes(category ?? '') ? (category as AppCategory) : 'other';

// # Libraries (« Bibliothèque » of Edifice)
//
// Rule inherited from the old module (`aggregateApps`), arbitrary, but the one of the web client: kept on purpose (the field
// `libraries` of `GET /api/me/applications` is ignored, as the web client does):
// - an app hosted on `library.edifice.io` **without category** is a library;
// - the server sends the libraries without their config (category, color, help): they take those of the entry `library-info`,
//   which is a config, not an app.

/** Host of the libraries. */
export const LIBRARY_HOST = 'library.edifice.io';

/** Entry of `GET /api/me/applications` that holds the config of the libraries. Not an app. */
export const LIBRARY_CONFIG_APP_NAME = 'library-info';

export const isLibrary = (app: { address: string; category?: string }): boolean =>
  app.address.includes(LIBRARY_HOST) && !app.category;

/** The config of an app: that of `library-info` for a library (if there is one), else its own. */
export const getAppConfig = (app: AppConfig & { address: string }, libraryConfig: AppConfig | undefined): AppConfig => {
  const { category, color, helpUrls } = isLibrary(app) && libraryConfig ? libraryConfig : app;
  return { category, color, helpUrls };
};

// # Other services

/** Another service: an app without module and without known category. Shown apart, at the bottom of the lists. */
export const isOtherService = (app: Pick<EntApp, 'category'>, hasModule: boolean): boolean =>
  !hasModule && app.category === 'other';

// # List of « Mes applis »

/**
 * The apps of the list: the ones listed in « Mes applis » (`display`), sorted by label, with what the filters and the cards need.
 * @param favorites names of the favorite apps.
 * @param hasModule whether a module of the app matches an app, for the user.
 */
export const toListedApps = (
  apps: EntApp[],
  { favorites, hasModule }: { favorites: readonly string[]; hasModule: (appName: string) => boolean },
): ListedApp[] => {
  const favoriteNames = new Set(favorites);
  return apps
    .filter(app => app.display)
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(app => {
      const withModule = hasModule(app.name);
      return {
        app,
        hasModule: withModule,
        isFavorite: favoriteNames.has(app.name),
        isOtherService: isOtherService(app, withModule),
      };
    });
};

/** The switch « show all the apps »: off, only the apps that have a module are shown. */
const isShownBySwitch = (item: ListedApp, showAllApps: boolean) => showAllApps || item.hasModule;

/** Whether « Mes applis » has apps to show at all (else: its empty screen, without filters). Rule inherited from the old screen. */
export const hasAppsToList = (items: ListedApp[], showAllApps: boolean): boolean =>
  items.some(item => isShownBySwitch(item, showAllApps));

const matchesFilter = ({ app, isFavorite, isOtherService: otherService }: ListedApp, filter: MyAppsFilter): boolean => {
  switch (filter.type) {
    case 'all':
      return true;
    case 'favorites':
      return isFavorite;
    case 'category':
      return app.category === filter.value;
    case 'other-services':
      return otherService;
    case 'libraries':
      return app.isLibrary;
    case 'search': {
      const query = normalizeString(filter.value.trim());
      return !query || normalizeString(app.label).includes(query);
    }
  }
};

/**
 * Apps of a filter, in the order to show them (from `toListedApps`). Rules inherited from `applyFilter` and `useFilteredApps`:
 * - favorites: all the favorites, whatever the switch, **in the order of the preferences** (the order the user chose);
 * - else, the apps that are not other services, as the switch shows them (and the favorites too, for a search);
 * - the other services are added at the end for `all`, `other-services` and a search (only the matching ones, for a search).
 * @param favorites names of the favorite apps, in the order of the preferences.
 */
export const filterApps = (
  items: ListedApp[],
  filter: MyAppsFilter,
  { favorites, showAllApps }: { favorites: readonly string[]; showAllApps: boolean },
): ListedApp[] => {
  const matching = items.filter(item => matchesFilter(item, filter));
  if (filter.type === 'favorites') {
    const ranks = new Map(favorites.map((name, rank) => [name, rank]));
    return [...matching].sort((a, b) => ranks.get(a.app.name)! - ranks.get(b.app.name)!);
  }
  const otherServices = (list: ListedApp[]) => list.filter(item => item.isOtherService);
  const main = matching.filter(
    item => !item.isOtherService && (isShownBySwitch(item, showAllApps) || (filter.type === 'search' && item.isFavorite)),
  );
  switch (filter.type) {
    case 'search':
      return [...main, ...otherServices(matching)];
    case 'all':
    case 'other-services':
      return [...main, ...otherServices(items)];
    default:
      return main;
  }
};
