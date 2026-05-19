import AllModules from '~/app/modules';
import theme from '~/app/theme';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { createMyAppsServiceWithTokenFetch, myAppsService } from '~/framework/modules/myapps/service';
import {
  AppBookmarks,
  ApplicationsConfig,
  AppsInfo,
  AppsInfoAggregated,
  MyAppsCategory,
  MyAppsFilter,
  MyAppsFilterCategories,
  MyAppsFilterTypes,
} from '~/framework/modules/myapps/types';
import {
  computeTestID,
  getAppName,
  getModuleRouteName,
  getTranslatedAppLabel,
  normalizeIconName,
  normalizeString,
} from '~/framework/modules/myapps/utils';
import { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import { AnyModule, AnyNavigableModule, IAppBadgeInfo, IAppThemeInfo, IEntcoreApp } from '~/framework/util/moduleTool';

type BadgeOverridesType = Record<string, { color?: string; icon?: string }>;

const resolveAppColor = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor].regular : undefined;

const resolveAppShades = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor] : theme.palette.grey;

const MYAPPS_FILTERS_CATEGORY_MAP: Record<string, MyAppsCategory> = {
  communication: MyAppsFilterCategories.communication,
  organisation: MyAppsFilterCategories.organisation,
  pedagogy: MyAppsFilterCategories.pedagogie,
};

const APP_AGGREGATION_OVERRIDES: BadgeOverridesType = {
  Directory: { color: 'green', icon: 'userbook' },
};

/**
 * Maps normalized backend icon names to mobile icon names where they differ.
 * Use this when the backend `icon` field doesn't match any available mobile icon asset.
 */
const ICON_NAME_MAP: Record<string, string> = {
  viescolaire: 'parametrage',
};

const NOTIF_TYPE_BADGE_OVERRIDES: BadgeOverridesType = {
  'TIMELINE.NOTIFY-REPORT': { color: 'yellow', icon: 'report' },
};

const FALLBACK_BADGE: IAppBadgeInfo = {
  color: theme.palette.grey.cloudy,
  icon: 'ui-infoCircle',
};

export const resolveAppCategory = (app: AppsInfoAggregated): MyAppsCategory =>
  MYAPPS_FILTERS_CATEGORY_MAP[app.category ?? ''] ?? MyAppsFilterCategories.otherServices;

export const isNavigableModule = (module: AnyModule): module is AnyNavigableModule => {
  return typeof (module as AnyNavigableModule).getRoot === 'function';
};

export const isMobileApp = (app: IEntcoreApp, modules: AnyNavigableModule[]): boolean => {
  return modules.some(module => module.config.matchEntcoreApp === app.name);
};

export const computeNextBookmarks = (bookmarks: string[], appName: string): string[] => {
  const isFavorite = bookmarks.includes(appName);

  return isFavorite ? bookmarks.filter(name => name !== appName) : [...bookmarks, appName];
};

export const checkIfIsConnector = (app: AppsInfo): boolean => {
  if (!app.isMobile) return true;
  if (app.target === '_blank') return true;

  if (app.address?.startsWith('http://') || app.address?.startsWith('https://')) {
    return true;
  }

  if (app.address?.includes('#/')) return true;

  if (!app.prefix) return true;

  return false;
};

export const appShouldBeAtBottom = (app: AppsInfoAggregated) => {
  const category = resolveAppCategory(app);

  return (
    app.isConnector &&
    !app.isMobile &&
    category !== MyAppsFilterCategories.communication &&
    category !== MyAppsFilterCategories.organisation &&
    category !== MyAppsFilterCategories.pedagogie
  );
};

export const enrichAppsWithModuleInfo = (appsInfo: AppsInfo[], modules: AnyNavigableModule[]) =>
  appsInfo.map(app => {
    const isMobile = isMobileApp(app as IEntcoreApp, modules);
    const routeName = getModuleRouteName(app as IEntcoreApp, modules);
    const isConnector = checkIfIsConnector(app);
    return { ...app, isConnector, isMobile, routeName };
  });

export const aggregateApps = (
  appsInfo: AppsInfo[],
  appsConfig: ApplicationsConfig[],
  favorites: AppBookmarks,
): Record<string, AppsInfoAggregated> => {
  const configByName = new Map(appsConfig.map(c => [c.name, c]));
  const favoriteBookmarks = new Set(favorites.bookmarks ?? []);
  const libraryConfig = configByName.get('library-info');

  const sortedApps = appsInfo
    .map(app => {
      let config = configByName.get(app.name);
      const isLibrary = app.address?.includes('library.edifice.io') && !config?.category;
      const isFavorite = favoriteBookmarks.has(app.name);

      if (isLibrary && libraryConfig) {
        config = { ...libraryConfig, name: app.name };
      }

      const override = APP_AGGREGATION_OVERRIDES[app.name];
      const normalizedIcon = normalizeIconName(app.icon);

      return {
        ...app,
        category: config?.category,
        color: override?.color ?? config?.color,
        displayName: getAppName(app),
        help: config?.help,
        icon: override?.icon ?? ICON_NAME_MAP[normalizedIcon] ?? normalizedIcon,
        isFavorite,
        isLibrary,
        libraries: config?.libraries,
        testID: config ? computeTestID(app) : '',
      };
    })
    .sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)));

  const aggregated: Record<string, AppsInfoAggregated> = {};
  for (const app of sortedApps) {
    aggregated[app.name] = app;
  }

  return aggregated;
};

/**
 * Builds a lookup map to resolve app badge or theme.
 *
 * matchEntcoreApp links the mobile module to the backend app:
 * module.config.matchEntcoreApp === app.name
 *
 * We store the same app with:
 * - module.config.name ==> mobile key
 * - module.config.entcoreScope[] ==> backend keys
 *
 * This allows fast lookup from any app identifier.
 */

export const buildAppLookupMap = (aggregatedApps: Record<string, AppsInfoAggregated>): Map<string, AppsInfoAggregated> => {
  const map = new Map<string, AppsInfoAggregated>();
  for (const module of AllModules().filter(isNavigableModule)) {
    if (!module.config.matchEntcoreApp) continue;
    const app = aggregatedApps[module.config.matchEntcoreApp];
    if (!app) continue;

    map.set(module.config.name, app);
    for (const scope of module.config.entcoreScope) {
      map.set(scope, app);
    }
  }
  return map;
};

export const resolveAppBadge = (appName: string, lookupMap: Map<string, AppsInfoAggregated>): IAppBadgeInfo => {
  const app = lookupMap.get(appName);
  return app ? { color: resolveAppColor(app.color), icon: app.icon } : FALLBACK_BADGE;
};

export const resolveAppTheme = (appName: string, lookupMap: Map<string, AppsInfoAggregated>): IAppThemeInfo | undefined => {
  const app = lookupMap.get(appName);
  return app ? { colors: resolveAppShades(app.color), icon: app.icon } : undefined;
};

export const getTabModuleDisplayName = (
  moduleConfig: Pick<AnyNavigableModule['config'], 'name' | 'matchEntcoreApp'>,
  aggregatedApps: Record<string, AppsInfoAggregated>,
): string => {
  const { matchEntcoreApp, name } = moduleConfig;

  const matchingApp = matchEntcoreApp ? aggregatedApps[matchEntcoreApp] : undefined;
  if (matchingApp?.displayName) return matchingApp.displayName;

  // will be removed when myapps.module.config.name will be "portal" instead of "myapps"
  // in /myapps/module-config.ts
  const aliases: Record<string, string[]> = {
    myapps: ['portal'],
  };

  for (const value of [matchingApp?.name, matchEntcoreApp, name, ...(aliases[name] ?? [])]) {
    const translated = getTranslatedAppLabel(value);
    if (translated) return translated;
  }

  return name;
};

export const buildNotifTypeLookupMap = (notifTypes: IEntcoreNotificationType[]): Map<string, IEntcoreNotificationType> =>
  new Map(notifTypes.map(nt => [`${nt.type}.${nt['event-type']}`, nt]));

/**
 * Resolve a notification badge from its type using the notification type
 * definitions which contains `app-name` and the aggregated apps as the single source of truth.
 */
export const resolveNotifBadge = (
  notifType: string,
  notifTypeMap: Map<string, IEntcoreNotificationType>,
  aggregatedApps: Record<string, AppsInfoAggregated>,
): IAppBadgeInfo | undefined => {
  const appName = notifTypeMap.get(notifType)?.['app-name'];

  if (!appName) return undefined;

  const app = aggregatedApps[appName];
  if (!app) return undefined;

  const override = NOTIF_TYPE_BADGE_OVERRIDES[notifType];
  return {
    color: resolveAppColor(override?.color ?? app.color),
    icon: override?.icon ?? app.icon,
  };
};

export const buildFetchSuccessPayload = (appsInfo: AppsInfo[], appsConfig: ApplicationsConfig[], favorites: AppBookmarks) => {
  const aggregatedApps = aggregateApps(appsInfo, appsConfig, favorites);
  return { aggregatedApps, appsConfig, appsInfo, favorites };
};

export const loadAppsDataFromService = async (
  appsService: typeof myAppsService | ReturnType<typeof createMyAppsServiceWithTokenFetch>,
  accountOrSession: AuthActiveAccount,
) => {
  const modules = AllModules().filterAvailables(accountOrSession).filter(isNavigableModule);

  const [appsInfo, appsConfig, favorites] = await Promise.all([appsService.list(), appsService.config(), appsService.bookmarks()]);

  const enrichedAppsInfo = enrichAppsWithModuleInfo(appsInfo, modules);
  return buildFetchSuccessPayload(enrichedAppsInfo, appsConfig, favorites);
};

export const applyFilter = (apps: Record<string, AppsInfoAggregated>, filter: MyAppsFilter): AppsInfoAggregated[] => {
  const appsArray = Object.values(apps).filter(app => app.display);
  switch (filter.type) {
    case MyAppsFilterTypes.Favorites:
      return appsArray.filter(app => app.isFavorite);
    case MyAppsFilterTypes.Category:
      if (filter.value === MyAppsFilterCategories.all) return appsArray;
      if (filter.value === MyAppsFilterCategories.otherServices) return appsArray.filter(appShouldBeAtBottom);
      return appsArray.filter(app => resolveAppCategory(app) === filter.value);
    case MyAppsFilterTypes.Search: {
      if (!filter.value.trim()) return appsArray;
      const q = normalizeString(filter.value);
      return appsArray.filter(app => normalizeString(app.displayName).includes(q));
    }
    case MyAppsFilterTypes.Libraries:
      return appsArray.filter(app => app.isLibrary);
  }
};
