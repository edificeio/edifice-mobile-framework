/**
 * How the apps are sorted out: categories, libraries, other services, and the filters of the list of « Mes applis ».
 */
import { APP_CATEGORIES, AppCategory, AppConfig, AppModule, EntApp, MyAppsFilter } from '~/modules/myapps/model';
import { normalizeString } from '~/modules/myapps/util';

// # Category

/** The category of the server when the app knows it, else `other`. */
export const getAppCategory = (category: string | undefined): AppCategory =>
  (APP_CATEGORIES as readonly string[]).includes(category ?? '') ? (category as AppCategory) : 'other';

// # Libraries (« Bibliothèque » of Edifice)
//
// Rule inherited from the old module (`aggregateApps`), arbitrary:
// - an app hosted on `library.edifice.io` **without category** is a library;
// - the server sends the libraries without their config (category, color, help): they take those of the entry `library-info`,
//   which is a config, not an app.
//
// ToDo(myapps-migration): the field `libraries` of `GET /api/me/applications` should replace the detection (see
// `docs/migrations/later.md`).

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

/**
 * Another service: an app without module and without known category. Shown apart, at the bottom of the lists.
 * @param module the module of the app, if one is available for the user (computed when read).
 */
export const isOtherService = (app: Pick<EntApp, 'category'>, module: AppModule | undefined): boolean =>
  module === undefined && app.category === 'other';

// # Filters of the list

/** What the list needs besides the apps (see `filterApps`): each one is a data of its own (see `model/index.ts`). */
interface FilterAppsContext {
  /** Names of the favorite apps. */
  favorites: ReadonlySet<string>;
  /** The module of an app (by its `name`), if one is available for the user. */
  getModule: (appName: string) => AppModule | undefined;
  /** The switch « show all the apps »: off, only the modules (see `filterApps`). */
  showAllApps: boolean;
}

/** An app with what the filters need to know of it. */
interface ListedApp<App extends EntApp> {
  app: App;
  hasModule: boolean;
  isFavorite: boolean;
  isOtherService: boolean;
}

const matchesFilter = ({ app, isFavorite, isOtherService: otherService }: ListedApp<EntApp>, filter: MyAppsFilter): boolean => {
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
 * Apps of a filter, in the order to show them. Rules inherited from `applyFilter` and `useFilteredApps`:
 * - only the apps listed in « Mes applis » (`display`), sorted by label;
 * - favorites: all the favorites, whatever `showAllApps`;
 * - else, the apps that are not other services; only the modules if `showAllApps` is off (and the favorites too, for a search);
 * - the other services are added at the end for `all`, `other-services` and a search (only the matching ones, for a search).
 */
export const filterApps = <App extends EntApp>(apps: App[], filter: MyAppsFilter, context: FilterAppsContext): App[] => {
  const { favorites, getModule, showAllApps } = context;
  const listed: ListedApp<App>[] = apps
    .filter(app => app.display)
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(app => {
      const module = getModule(app.name);
      return {
        app,
        hasModule: module !== undefined,
        isFavorite: favorites.has(app.name),
        isOtherService: isOtherService(app, module),
      };
    });
  const matching = listed.filter(item => matchesFilter(item, filter));
  const otherServices = (items: ListedApp<App>[]) => items.filter(item => item.isOtherService);
  const main = matching.filter(
    item => !item.isOtherService && (showAllApps || item.hasModule || (filter.type === 'search' && item.isFavorite)),
  );
  const result = (() => {
    switch (filter.type) {
      case 'favorites':
        return matching;
      case 'search':
        return [...main, ...otherServices(matching)];
      case 'all':
      case 'other-services':
        return [...main, ...otherServices(listed)];
      default:
        return main;
    }
  })();
  return result.map(item => item.app);
};
