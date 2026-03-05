import { AppsInfo, AppsInfoAggregated, MyAppsCategories } from '~/framework/modules/myapps/types';
import { AnyModule, AnyNavigableModule, IEntcoreApp } from '~/framework/util/moduleTool';

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
