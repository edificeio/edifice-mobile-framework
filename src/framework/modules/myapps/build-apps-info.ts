import { AppBookmarks, AppsInfo, AppType } from './types';

import { IEntcoreApp } from '~/framework/util/moduleTool';

/**
 * type:
 * - connector: external or non-integrated apps (blank, http, no prefix, hash routing, external flag, _blank)
 * - application: default
 * isMobile is resolved later (needs loaded modules)
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

    const type: AppType = isConnector ? 'connector' : 'application';

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
