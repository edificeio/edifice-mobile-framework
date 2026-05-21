import React from 'react';

import { useSelector } from 'react-redux';

import { addToCache } from '~/framework/components/picture/svg';
import { applyFilter, appShouldBeAtBottom } from '~/framework/modules/myapps/reducer/adapter';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer/selectors';
import { MyAppsFilter, MyAppsFilterTypes } from '~/framework/modules/myapps/types';

const precacheSvgIcons = (apps: Record<string, { icon?: string }>) => {
  for (const app of Object.values(apps)) {
    if (app.icon && !app.icon.includes('/') && !app.icon.includes('.')) {
      addToCache(app.icon);
    }
  }
};

export const useFilteredApps = (filter: MyAppsFilter, showAllApps = false) => {
  const aggregatedApps = useSelector(selectAggregatedApps);

  React.useEffect(() => {
    if (aggregatedApps) precacheSvgIcons(aggregatedApps);
  }, [aggregatedApps]);

  return React.useMemo(() => {
    if (!aggregatedApps) return [];

    const allApps = Object.values(aggregatedApps).filter(app => app.display);
    const bottomApps = allApps.filter(appShouldBeAtBottom);

    const filtered = applyFilter(aggregatedApps, filter) ?? [];
    const filteredTopApps = filtered.filter(app => !appShouldBeAtBottom(app));

    let baseResult: typeof filteredTopApps;
    if (filter.type === MyAppsFilterTypes.Favorites) {
      return filtered;
    } else if (showAllApps) {
      baseResult = filteredTopApps;
    } else if (filter.type === MyAppsFilterTypes.Search) {
      baseResult = filteredTopApps.filter(app => app.isMobile || app.isFavorite);
    } else {
      baseResult = filteredTopApps.filter(app => app.isMobile);
    }

    return [...baseResult, ...bottomApps];
  }, [aggregatedApps, filter, showAllApps]);
};
