import AllModules from '~/app/modules';
import theme from '~/app/theme';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { createMyAppsServiceWithTokenFetch, myAppsService } from '~/framework/modules/myapps/service';
import {
  AppBadgesType,
  AppBookmarks,
  ApplicationsConfig,
  AppsInfo,
  AppsInfoAggregated,
  MyAppsCategory,
  MyAppsFilter,
  MyAppsFilterCategories,
  MyAppsFilterTypes,
} from '~/framework/modules/myapps/types';
import { getAppName, getModuleRouteName, normalizeIconName, normalizeString, toKebabCase } from '~/framework/modules/myapps/utils';
import { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import { AnyModule, AnyNavigableModule, IAppBadgeInfo, IAppThemeInfo, IEntcoreApp } from '~/framework/util/moduleTool';

const resolveAppColor = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor].regular : undefined;

const resolveAppShades = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor] : theme.palette.grey;

const MYAPPS_FILTERS_CATEGORY_MAP: Record<string, MyAppsCategory> = {
  communication: MyAppsFilterCategories.communication,
  organisation: MyAppsFilterCategories.organisation,
  pedagogy: MyAppsFilterCategories.pedagogie,
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

  const aggregated: Record<string, AppsInfoAggregated> = {};

  appsInfo
    .map(app => {
      let config = configByName.get(app.name);
      const isLibrary = app.address?.includes('library.edifice.io') && !config?.category;
      const isFavorite = favorites.bookmarks?.includes(app.name);

      if (isLibrary) {
        const libraryConfig = configByName.get('library-info');
        if (libraryConfig) config = { ...libraryConfig, name: app.name };
      }

      return {
        ...app,
        badgeKey: app.displayName.toUpperCase(),
        category: config?.category,
        color: config?.color,
        displayName: getAppName(app),
        help: config?.help,
        icon: normalizeIconName(app.icon),
        isFavorite,
        isLibrary,
        libraries: config?.libraries,
        testID: config ? toKebabCase(app.name) : '',
      };
    })
    .sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)))
    .forEach(app => {
      aggregated[app.name] = app;
    });

  return aggregated;
};

const USERBOOK_BADGE: IAppBadgeInfo = {
  color: theme.palette.complementary.green?.regular,
  icon: 'userbook',
};

const FALLBACK_BADGE: IAppBadgeInfo = {
  color: theme.palette.grey.cloudy,
  icon: 'ui-infoCircle',
};

export const buildAppNameToBadge = (aggregatedApps: Record<string, AppsInfoAggregated>): AppBadgesType => {
  const badgesMap: AppBadgesType = {};
  for (const app of Object.values(aggregatedApps)) {
    badgesMap[app.badgeKey] = { color: resolveAppColor(app.color), icon: app.icon };
  }
  return badgesMap;
};

/**
 * Build a map of app names to their complete theme information (all color shades + icon)
 */
export const buildAppNameToTheme = (aggregatedApps: Record<string, AppsInfoAggregated>): Record<string, IAppThemeInfo> => {
  const themesMap: Record<string, IAppThemeInfo> = {};
  for (const app of Object.values(aggregatedApps)) {
    themesMap[app.badgeKey] = {
      colors: resolveAppShades(app.color),
      icon: app.icon,
    };
  }
  return themesMap;
};

export const getTabModuleDisplayName = (
  moduleConfig: Pick<AnyNavigableModule['config'], 'name' | 'matchEntcoreApp'>,
  aggregatedApps: Record<string, AppsInfoAggregated>,
): string => {
  const { matchEntcoreApp, name } = moduleConfig;

  const matchingApp = matchEntcoreApp ? Object.values(aggregatedApps).find(app => app.name === matchEntcoreApp) : undefined;
  return matchingApp?.displayName || name;
};

export const resolveBadgeByAppName = (appName: string, badgesIndex: AppBadgesType): IAppBadgeInfo =>
  badgesIndex[appName.toUpperCase()] ?? FALLBACK_BADGE;

export const buildNotifTypeToBadge = (
  aggregatedApps: Record<string, AppsInfoAggregated>,
  notifTypes: IEntcoreNotificationType[],
): AppBadgesType => {
  const appNameToInfo = new Map<string, IAppBadgeInfo>();
  for (const app of Object.values(aggregatedApps)) {
    appNameToInfo.set(app.name, { color: resolveAppColor(app.color), icon: app.icon });
  }
  const badgesMap: AppBadgesType = {};
  for (const notif of notifTypes) {
    if (!notif['app-name']) continue;

    if (notif.type.startsWith('USERBOOK')) {
      badgesMap[notif.type] = { ...USERBOOK_BADGE };
      continue;
    }

    const info = appNameToInfo.get(notif['app-name']);
    if (info) badgesMap[notif.type] = info;
  }

  return badgesMap;
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
