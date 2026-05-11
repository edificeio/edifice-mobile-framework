import React from 'react';

import { useSelector } from 'react-redux';

import { addToCache } from '~/framework/components/picture/svg';
import { applyFilter } from '~/framework/modules/myapps/reducer/adapter';
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
    const filtered = applyFilter(aggregatedApps, filter) || [];
    if (showAllApps || filter.type === MyAppsFilterTypes.Favorites) return filtered;
    if (filter.type === MyAppsFilterTypes.Search) {
      return filtered.filter(app => app.isMobile || app.isFavorite);
    }
    return filtered.filter(app => app.isMobile);
  }, [aggregatedApps, filter, showAllApps]);
};
