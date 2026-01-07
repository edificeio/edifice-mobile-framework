import { AppBookmarks, AppsInfo, AppType } from './types';

import { IEntcoreApp } from '~/framework/util/moduleTool';

/**
 * Initial apps mapping from Entcore data.
 *
 * type:
 * - connector: external or non-integrated apps (http(s), _blank, external flag, hash routing, missing prefix)
 * - web: internal apps by default
 *
 * The final app type ('web' or 'mobile') and the isMobile flag
 * are resolved after login, once all navigable modules are loaded
 * and matched against Entcore scopes.
 */
export function buildAppsInfo(entcoreApps: IEntcoreApp[], favorites: AppBookmarks): Omit<AppsInfo, 'isMobile'>[] {
  return entcoreApps.map(app => {
    const beginsWithHttp = /^https?:\/\//i;

    const isConnector =
      app.target === '_blank' ||
      beginsWithHttp.test(app.address) ||
      app.address.includes('#/') ||
      !app.prefix ||
      app.isExternal === true;

    const type: AppType = isConnector ? 'connector' : 'web';

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
