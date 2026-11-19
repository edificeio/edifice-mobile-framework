import type { ListedApp } from '~/modules/myapps/model';

import { MyAppsListItem } from './types';

export const isSeparator = (item: MyAppsListItem): item is { type: 'separator' } => item.type === 'separator';

export const buildAppItem = (item: ListedApp): MyAppsListItem => ({ item, type: 'app' });

/** The filter « all »: the other services at the end, after a separator (when there are apps before them). */
export const buildAllAppsCategoryList = (apps: ListedApp[]): MyAppsListItem[] => {
  const mainApps = apps.filter(item => !item.isOtherService);
  const otherServices = apps.filter(item => item.isOtherService);

  if (!otherServices.length || !mainApps.length) {
    return [...mainApps, ...otherServices].map(buildAppItem);
  }

  return [...mainApps.map(buildAppItem), { type: 'separator' }, ...otherServices.map(buildAppItem)];
};

/** Empty screens of a list that shows nothing: the filter « favorites », a search, or another filter. */
export const EMPTY_SCREEN_CONFIG = {
  favorites: {
    testID: 'myapps-empty-favorites',
    text: 'myapp-empty-screen-favorite-text',
    title: 'myapp-empty-screen-favorite-title',
  },
  other: { testID: 'myapps-empty-other', text: 'myapp-empty-screen-other-text', title: 'myapp-empty-screen-other-title' },
  search: { testID: 'myapps-empty-search', text: 'myapp-empty-screen-search-text', title: 'myapp-empty-screen-search-title' },
};
