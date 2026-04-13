import { I18n } from '~/app/i18n';
import AllModules from '~/app/modules';
import theme from '~/app/theme';
import {
  AppBadgesType,
  AppBookmarks,
  ApplicationsConfig,
  AppsInfo,
  AppsInfoAggregated,
  MyAppsCategories,
  MyAppsFilter,
} from '~/framework/modules/myapps/types';
import { getAppName, getModuleRouteName, normalizeString } from '~/framework/modules/myapps/utils';
import { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import { AnyModule, AnyNavigableModule, IAppBadgeInfo, IAppThemeInfo, IEntcoreApp } from '~/framework/util/moduleTool';

const resolveAppColor = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor].regular : undefined;

const resolveAppShades = (appColor?: string) =>
  appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor] : theme.palette.grey;

export const resolveAppCategory = (app: AppsInfoAggregated): MyAppsCategories => {
  switch (app.category) {
    case 'communication':
      return 'communication';

    case 'pedagogy':
      return 'pedagogie';

    case 'organisation':
      return 'organisation';

    default:
      return 'otherServices';
  }
};

export const isNavigableModule = (module: AnyModule): module is AnyNavigableModule => {
  return typeof (module as AnyNavigableModule).getRoot === 'function';
};

export const isMobileApp = (app: IEntcoreApp, modules: AnyNavigableModule[]): boolean => {
  return modules.some(module => module.config.matchEntcoreApp(app));
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

export const appShouldBeAtBottom = (app: AppsInfoAggregated) =>
  app.isConnector && !app.isMobile && !['communication', 'organisation', 'pedagogy'].includes(app.category ?? '');

export const enrichAppsWithModuleInfo = (appsInfo: AppsInfo[], modules: any) =>
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
        isFavorite,
        isLibrary,
        libraries: config?.libraries,
      };
    })
    .filter(app => app.display)
    .sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)))
    .forEach(app => {
      aggregated[app.name] = app;
    });

  return aggregated;
};

const USERBOOK_BADGE: IAppBadgeInfo = {
  color: theme.palette.complementary.green?.regular,
  icon: 'userbook-large',
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

export const buildModuleTabDisplayName = (
  moduleConfig: AnyNavigableModule['config'],
  aggregatedApps: Record<string, AppsInfoAggregated>,
): string => {
  const matchingApp = aggregatedApps[moduleConfig.name];
  if (matchingApp) {
    return matchingApp.displayName;
  }

  if (moduleConfig.tabDisplayName) {
    return I18n.get(moduleConfig.tabDisplayName);
  }

  return moduleConfig.name;
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

/**
 * Helper function to load apps data from a service given an account/session context.
 * Fetches list, config, and bookmarks in parallel, enriches with module info, and builds the payload.
 * @param appsService The apps service to fetch from (may use different tokens/auth)
 * @param accountOrSession The account info or session used to filter available modules
 * @returns Promise of FetchSuccessPayload ready to dispatch
 */
export const loadAppsDataFromService = async (appsService: any, accountOrSession: any) => {
  const modules = AllModules().filterAvailables(accountOrSession).filter(isNavigableModule);

  const [appsInfo, appsConfig, favorites] = await Promise.all([appsService.list(), appsService.config(), appsService.bookmarks()]);

  const enrichedAppsInfo = enrichAppsWithModuleInfo(appsInfo, modules);
  return buildFetchSuccessPayload(enrichedAppsInfo, appsConfig, favorites);
};

export const applyFilter = (apps: Record<string, AppsInfoAggregated>, filter: MyAppsFilter): AppsInfoAggregated[] => {
  const appsArray = Object.values(apps);
  switch (filter.type) {
    case 'favorites':
      return appsArray.filter(app => app.isFavorite);
    case 'category':
      if (filter.value === 'toutes') return appsArray;
      if (filter.value === 'otherServices') return appsArray.filter(appShouldBeAtBottom);
      return appsArray.filter(app => resolveAppCategory(app) === filter.value);
    case 'search': {
      if (!filter.value.trim()) return appsArray;
      const q = normalizeString(filter.value);
      return appsArray.filter(app => normalizeString(app.displayName).includes(q));
    }
    case 'libraries':
      return appsArray.filter(app => app.isLibrary);
  }
};
