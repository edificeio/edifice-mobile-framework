import { appShouldBeAtBottom, resolveAppCategory } from './adapter';

import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AppBookmarks, AppsInfoAggregated, AppsInfoWithCategory, MyAppsFilter } from '~/framework/modules/myapps/types';
import { getAppName, normalizeString } from '~/framework/modules/myapps/utils';

export const selectAppsState = (state: IGlobalState) => {
  return moduleConfig.getState(state) ?? appsInfoInitialState;
};

export const selectIsSavingFavorites = (state: IGlobalState): boolean => Boolean(selectAppsState(state).isSavingFavorites);

export const selectAppBookmarks = (state: IGlobalState): AppBookmarks => {
  const slice = selectAppsState(state);
  return slice.favorites;
};

export const getAllappsShowedState = (state: IGlobalState): boolean => {
  const { showAllApps } = selectAppsState(state);
  return Boolean(showAllApps);
};

export const selectAggregatedApps = (state: IGlobalState): AppsInfoAggregated[] => {
  const slice = selectAppsState(state);
  const appsConfig = slice?.appsConfig ?? [];
  const appsInfo = slice?.appsInfo ?? [];
  const favorites = selectAppBookmarks(state);
  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo
    .map(app => {
      let config = configByName.get(app.name);

      const isLibrary = app.address?.includes('library.edifice.io') && !config?.category;
      const isFavorite = favorites.bookmarks?.includes(app.name);

      if (isLibrary) {
        const libraryConfig = configByName.get('library-info');
        if (libraryConfig) {
          config = {
            ...libraryConfig,
            name: app.name,
          };
        }
      }

      return {
        ...app,
        category: config?.category,
        color: config?.color,
        displayName: getAppName(app),
        help: config?.help,
        isFavorite,
        isLibrary,
        libraries: config?.libraries,
      };
    })
    .sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)))
    .filter(app => app.display);
};

export const selectAppsRaw = (state: IGlobalState) => {
  const slice = selectAppsState(state);
  return {
    appsConfig: slice.appsConfig,
    appsInfo: slice.appsInfo,
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
      if (filter.value === 'otherServices') {
        return apps.filter(appShouldBeAtBottom);
      }
      return apps.filter(app => app.resolvedCategory === filter.value);
    case 'search': {
      if (!filter.value.trim()) return apps;
      const normalizedStr = normalizeString(filter.value);
      return apps.filter(app => normalizeString(app.displayName).includes(normalizedStr));
    }
    case 'libraries':
      return apps.filter(app => app.isLibrary);
  }
};

export const selectFilteredAppsWithMobile = (state: IGlobalState, filter: MyAppsFilter, showAllApps: boolean) => {
  const apps = selectFilteredApps(state, filter);

  if (showAllApps) {
    return apps;
  }

  return apps.filter(app => app.isMobile);
};
