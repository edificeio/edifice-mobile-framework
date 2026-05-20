import { MyAppsListItem } from './types';

import { appShouldBeAtBottom } from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const isSeparator = (item: MyAppsListItem): item is { type: 'separator' } => item.type === 'separator';

export const buildAppItem = (app: AppsInfoAggregated): MyAppsListItem => ({
  app,
  type: 'app',
});

export const buildAllAppsCategoryList = (apps: AppsInfoAggregated[]): MyAppsListItem[] => {
  const mobileAndInternal = apps.filter(app => !appShouldBeAtBottom(app));

  const externalConnectors = apps.filter(appShouldBeAtBottom);

  if (!externalConnectors.length || !mobileAndInternal.length) {
    return [...mobileAndInternal, ...externalConnectors].map(buildAppItem);
  }

  return [...mobileAndInternal.map(buildAppItem), { type: 'separator' }, ...externalConnectors.map(buildAppItem)];
};
