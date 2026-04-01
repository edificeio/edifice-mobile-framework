import { FetchSuccessPayload } from './action-types';

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
import { AnyModule, AnyNavigableModule, IAppBadgeInfo, IEntcoreApp } from '~/framework/util/moduleTool';

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
): AppsInfoAggregated[] => {
  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo
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
    .sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)));
};

const USERBOOK_BADGE: IAppBadgeInfo = {
  color: theme.palette.complementary.green?.regular,
  icon: 'userbook-large',
};

const FALLBACK_BADGE: IAppBadgeInfo = {
  color: theme.palette.grey.cloudy,
  icon: 'ui-infoCircle',
};

export const buildAppNameToBadge = (aggregatedApps: AppsInfoAggregated[]): AppBadgesType => {
  const badgesMap: AppBadgesType = {};
  for (const app of aggregatedApps) {
    const appColor = app.color;
    const color = appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor].regular : undefined;
    badgesMap[app.badgeKey] = { color, icon: app.icon };
  }
  return badgesMap;
};

export const resolveBadgeByAppName = (appName: string, badgesIndex: AppBadgesType): IAppBadgeInfo =>
  badgesIndex[appName.toUpperCase()] ?? FALLBACK_BADGE;

export const buildNotifTypeToBadge = (
  aggregatedApps: AppsInfoAggregated[],
  notifTypes: IEntcoreNotificationType[],
): AppBadgesType => {
  const appNameToInfo = new Map<string, IAppBadgeInfo>();
  for (const app of aggregatedApps) {
    const appColor = app.color;
    const color = appColor && theme.palette.complementary[appColor] ? theme.palette.complementary[appColor].regular : undefined;
    appNameToInfo.set(app.name, { color, icon: app.icon });
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

export const buildFetchSuccessPayload = (
  appsInfo: AppsInfo[],
  appsConfig: ApplicationsConfig[],
  favorites: AppBookmarks,
): FetchSuccessPayload => {
  const aggregatedApps = aggregateApps(appsInfo, appsConfig, favorites);
  return { aggregatedApps, appsConfig, appsInfo, favorites };
};

export const applyFilter = (apps: AppsInfoAggregated[], filter: MyAppsFilter): AppsInfoAggregated[] => {
  switch (filter.type) {
    case 'favorites':
      return apps.filter(app => app.isFavorite);
    case 'category':
      if (filter.value === 'toutes') return apps;
      if (filter.value === 'otherServices') return apps.filter(appShouldBeAtBottom);
      return apps.filter(app => resolveAppCategory(app) === filter.value);
    case 'search': {
      if (!filter.value.trim()) return apps;
      const q = normalizeString(filter.value);
      return apps.filter(app => normalizeString(app.displayName).includes(q));
    }
    case 'libraries':
      return apps.filter(app => app.isLibrary);
  }
};
