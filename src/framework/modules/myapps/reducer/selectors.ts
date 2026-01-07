import { resolveAppCategory } from './adapter';

import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AppsInfoAggregated, AppsInfoWithCategory, MyAppsFilter } from '~/framework/modules/myapps/types';

export const selectAppsState = (state: IGlobalState) => {
  return moduleConfig.getState(state) ?? appsInfoInitialState;
};

export const selectAggregatedApps = (state: IGlobalState): AppsInfoAggregated[] => {
  const slice = selectAppsState(state);
  const appsConfig = slice?.appsConfig ?? [];
  const appsInfo = slice?.appsInfo ?? [];

  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo
    .map(app => {
      const config = configByName.get(app.name);

      return {
        ...app,
        category: config?.category,
        color: config?.color,
        help: config?.help,
        libraries: config?.libraries,
      };
    })
    .sort((a, b) => (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name))
    .filter(app => app.display);
};

export const selectAppsRaw = (state: IGlobalState) => {
  const slice = selectAppsState(state);
  return {
    appsConfig: slice.appsConfig,
    appsInfo: slice.appsInfo,
    entcoreApps: slice.entcoreApps,
  };
};

const getAppsWithResolvedCategory = (state: IGlobalState): AppsInfoWithCategory[] => {
  const apps = selectAggregatedApps(state);

  return apps.map(app => ({
    ...app,
    resolvedCategory: resolveAppCategory(app),
  }));
};

export const selectFilteredApps = (state: IGlobalState, filter: MyAppsFilter) => {
  const apps = getAppsWithResolvedCategory(state);

  switch (filter.type) {
    case 'favorites':
      return apps.filter(app => app.isFavorite);

    case 'category':
      if (filter.value === 'toutes') return apps;
      return apps.filter(app => app.resolvedCategory === filter.value);
  }
};
