import { AppBookmarks, AppsInfo, AppType } from './types';

import { IEntcoreApp, ModuleArray } from '~/framework/util/moduleTool';
/**
 * AppType resolution:
 * mobile: matched by module-config (matchEntcoreApp)
 * connector: external or non-integrated apps (blank, http, no prefix)
 * web: default
 */
export function buildAppsInfo(entcoreApps: IEntcoreApp[], favorites: AppBookmarks, modules: ModuleArray): AppsInfo[] {
  return entcoreApps.map(app => {
    const matchingModule = modules.find(m => {
      const matcher = m.config.matchEntcoreApp;

      if (!matcher) return false;

      if (typeof matcher === 'string') {
        const match = app.address === matcher;
        return match;
      }

      if (typeof matcher === 'function') {
        const match = matcher(app, entcoreApps);

        return match;
      }

      return false;
    });

    const beginsWithHttp: RegExp = /^https?:\/\//i;
    const isConnector =
      app.isExternal || app.target === '_blank' || beginsWithHttp.test(app.address) || app.address.includes('#/') || !app.prefix;

    const type: AppType = isConnector ? 'connector' : 'web';

    console.debug('[buildAppsInfo][RESULT]', {
      app: app.name,
      finalType: type,
      hasPrefix: !!app.prefix,
      matchedModule: matchingModule?.config.name ?? null,
      prefix: app.prefix,
    });

    return {
      address: app.address,
      display: app.display,
      displayName: app.displayName,
      icon: app.icon,
      isFavorite: favorites.bookmarks.includes(app.name),
      isPinned: favorites.applications.includes(app.name),
      name: app.name,
      prefix: app.prefix,
      target: app.target ?? undefined,
      type,
    };
  });
}
