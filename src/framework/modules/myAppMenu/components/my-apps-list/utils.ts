import { MyAppsListItem } from './types';

import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const isSeparator = (item: MyAppsListItem): item is { type: 'separator' } => item.type === 'separator';

export const buildAppItem = (app: AppsInfoAggregated): MyAppsListItem => ({
  app,
  type: 'app',
});

export const buildAllAppsCategoryList = (apps: AppsInfoAggregated[]): MyAppsListItem[] => {
  const mobileAndInternal = apps.filter(app => app.isMobile || (app.isConnector && !app.isExternal));

  const externalConnectors = apps.filter(app => app.isConnector && app.isExternal);

  if (!externalConnectors.length) {
    return mobileAndInternal.map(buildAppItem);
  }

  return [...mobileAndInternal.map(buildAppItem), { type: 'separator' }, ...externalConnectors.map(buildAppItem)];
};
