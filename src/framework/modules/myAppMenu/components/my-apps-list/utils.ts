import { MyAppsListItem } from './types';

import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const isSeparator = (item: MyAppsListItem): item is { type: 'separator' } => item.type === 'separator';

export const buildAppItem = (app: AppsInfoAggregated): MyAppsListItem => ({
  app,
  type: 'app',
});

export const buildFavoritesList = (apps: AppsInfoAggregated[]): MyAppsListItem[] => {
  const mobileApps = apps.filter(app => app.isMobile);
  const otherApps = apps.filter(app => !app.isMobile);

  if (!otherApps.length) {
    return mobileApps.map(buildAppItem);
  }

  return [...mobileApps.map(buildAppItem), { type: 'separator' }, ...otherApps.map(buildAppItem)];
};
