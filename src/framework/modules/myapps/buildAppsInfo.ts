import { AppBookmarks, AppsInfo, AppType } from './types';

import { IEntcoreApp } from '~/framework/util/moduleTool';
/**
 * AppType resolution:
 * mobile: matched by module-config (matchEntcoreApp)
 * connector: external or non-integrated apps (blank, http, no prefix)
 * web: default
 */
export function buildAppsInfo(entcoreApps: IEntcoreApp[], favorites: AppBookmarks): AppsInfo[] {
  return entcoreApps.map(app => {
    const beginsWithHttp = /^https?:\/\//i;

    const isConnector = app.target === '_blank' || beginsWithHttp.test(app.address) || app.address.includes('#/') || !app.prefix;

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
